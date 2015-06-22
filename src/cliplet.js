(function (root, document) {

  /**
   * Base cliplet namespace.
   *
   * @const
   */
  root.cliplet = root.cliplet || {};

  /**
   * Default cliplet options that will be overriden with 
   * anything defined within the global cliplet scope.
   * 
   * @const
   */
  var defaults = {

    /**
     * The agent to use to display. Available values are:
     *   Clippy
     *   Merlin
     *   Rover
     *   Links
     * 
     * @type {String}
     */
    agent: 'Clippy',

    /**
     * The base chatter interval in miliseconds for determining when 
     * clippy will produce a helpful message.
     * 
     * @type {Number}
     */
    chatterInterval: 120000,

    /**
     * The chatter interval spread that adds just a bit of randomness to clippys alerts.
     * This number is used as a random range thats added to the chatter interval.
     * 
     * @type {Number}
     */
    chatterIntervalSpread: 30000,

    /**
     * Produces a phrase. This call is async whic allows you to use 3rd party apis to 
     * produce phrases.
     *
     * @example
     *   say: function (options, say) {
     *     $.getJSON('api/v1/phrase.json', function (result) {
     *       say(result.phrase);
     *     });
     *   }
     *
     * @async
     * @param  {!Object} options
     * @param  {!Function(String)} say
     */
    say: function (options, say) {
      var bag = options.chatter,
          index = Math.random() * bag.length | 0;

      say(bag[index]);
    },

    /**
     * Possible 'helpful' messages for the default say method.
     * 
     * @type {Array<String>}
     */
    chatter: [
      'Press the print screen key and paste the image into an image editor to save your work.',
      'Try clicking on a link on to navigate.',
      'Can\'t find what you are looking for? Try using Ask Jeves.',
      'It looks like you\'re trying to launder money! You might consider buying a cash operated business.'
    ]
  };

  /**
   * Asset loader module.
   *
   * @module loader
   * @requires root
   */
  var loader = (function (global) {

    /**
     * A factory collection that contains a kv pair of an extension and its factory.
     *  
     * @type {Object<String, Function(String): Element}
     */
    var factories = {

      /**
       * Produce a link element from source.
       * 
       * @param  {!String} src
       * @return {!Element}
       */
      css: function (src) {
        var $el = this.createElement('link');

        $el.rel = "stylesheet";
        $el.href = src;

        return $el;
      },

      /**
       * Produce a js script tag from source.
       * 
       * @param  {!String} src 
       * @return {!Element}
       */
      js: function (src) {
        var $el = this.createElement('script');

        $el.type = 'text/javascript';
        $el.src = src;

        return $el;
      }
    };

    /**
     * Loads a specific resource then trigger callback.
     * 
     * @param  {!String} src
     * @param  {!Function} then
     */
    var load = function (src, then) {
      var as = src.split('.').pop(),
          doc = global.document,
          factory = factories[as],
          $tag = factory.call(doc, src);

      $tag.onload = then;

      doc.body.appendChild($tag);
    };

    /**
     * Public API exports.
     *
     * @exports loader
     * @type {Object<String, Function>}
     */
    var api = {

      /**
       * Loads a single or collection of resources then triggers callback.
       * 
       * @param  {!(String | Array<String>)} srcs
       * @param  {!Function} then
       */
      load: function (srcs, then) {
        if (typeof srcs === 'string') {
          load(srcs, then);
        } else {
          load(srcs.shift(), function () {
            if (srcs.length) {
              api.load(srcs, then);
            } else {
              then();
            }
          });
        }
      }
    };

    return api;
  }) (root);
  
  /**
   * Resource bundle module.
   *
   * @module bundle
   * @requires loader
   * @requires root
   */
  var bundle = (function (global, loader) {

    /**
     * Global cliplet namespace.
     * 
     * @const
     */
    var cliplet = global.cliplet;

    /**
     * Bundle that should be loaded.
     * 
     * @type {Array<String>}
     */
    var bundle = [
      '//cdn.rawgit.com/smore-inc/clippy.js/master/build/clippy.css'
    ];

    if (!global.jQuery) {
      bundle.push('//code.jquery.com/jquery-2.1.4.min.js');
    }

    if (!global.clippy) {
      bundle.push('//cdn.rawgit.com/smore-inc/clippy.js/master/build/clippy.min.js');
    }

    /**
     * Determines if the bundle has been loaded or sets a bundle loaded flag.
     *
     * @example
     *   loaded(); // returns bundle state.
     *   loaded(false); // sets bundle state.
     * 
     * @param  {!Boolean} flag
     * @return {?Boolean}
     */
    var loaded = function (flag) {
      if (typeof flag === 'undefined') {
        return global.cliplet.loaded;
      }

      global.cliplet.loaded = !!flag;
    };

    /**
     * Loads the bundle then triggers then on success.
     * 
     * @param  {!Function} then
     */
    var load = function (then) {
      if (!loaded()) {
        loader.load(bundle, function () {
          loaded(true);
          then();
        });
      } else {
        then();
      }
    };

    /**
     * Public API exports.
     *
     * @exports loader
     * @type {Object<String, Function>}
     */
    var api = {
      load: load
    };

    return api;
  }) (root, loader);
  
  /**
   * Cliplet module.
   * 
   * @module cliplet
   * @requires bundle
   * @requires cliplet
   * @requires defaults
   */
  var cliplet = (function (bundle, cliplet, defaults) {

    /**
     * Recusivly calls fn at a random intervals with an argument
     * determined by select.
     * 
     * @param  {!Number} interval
     * @param  {!Number} spread
     * @param  {!Function} select
     * @param  {!Function} fn
     */
    var doRandomly = function (interval, spread, select, fn) {
      var delay = interval + (Math.random() * spread) - (spread / 2);

      select(function (value) {
        fn(value);

        setTimeout(function () {
          doRandomly(interval, spread, select, fn);
        }, spread);
      });
    };

    /**
     * Boots the cliplet!
     */
    var start = function () {
      if (cliplet.active) {
        return;
      }

      bundle.load(function () {
        var options = $.extend({}, defaults, cliplet.options);

        clippy.load(options.agent, function(agent) {
          cliplet.active = true;

          agent.show();

          doRandomly(
            options.chatterInterval,
            options.chatterIntervalSpread,
            options.say.bind(root, options),
            function (phrase) {
              agent.speak(phrase);
            });
        });
      });
    };

    /**
     * Public API exports.
     *
     * @exports cliplet
     * @type {Object<String, Function>}
     */
    var api = {
      start: start,
    };

    return api;
  }) (bundle, root.cliplet, defaults);
  
  /**
   * Exports cliplet api.
   *
   * @type {cliplet}
   */
  root.cliplet.api = cliplet;

  /**
   * The cliplet version
   * 
   * @type {String}
   */
  root.cliplet.version = "<%- version %>";
  
  /**
   * Instantly boot unless cliplet is deffered
   */
  if (!root.cliplet.deffer) {
    root.cliplet.api.start();
  }
})(window, document);
Cliplet
=======

A wrapped clippy(js) bookmarklet. Powered by [clippyjs](https://github.com/smore-inc/clippy.js)

#Why?
Because of nostalgia. This project is ment to be minimal since there are countless amount of bookmarklets with really no reason to reinvent the weel.

#How to install
To install, simply copy the contents of bin/cliplet, create a new book mark, and paste the content as the book marks url. Click the bookmark and clippy agent will apear.

#Configuration
Currently the cliplet does very little besides display a message every minute or two. However it could do alot more if you are willing to configure or build the project yourself.

##Page configuration
The easiest way to configure cliplet is simply by changing the page cliplet object before clippy loads. This kind of breaks having a self contained application so it is not recommended.

To apply a set of options onto a page simply use the template below.
```javascript
cliplet = {

	/**
	 * If this value is set to true the book marklet will not auto initialize when clicked.
	 *
	 * @type {Boolean}
	 */
	defer: false,

	/**
	 * Clipplet configuration
	 *
	 * @type {Object}
	 */
	options: {
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
		 * @return {[type]}         [description]
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
		  'Can\'t find what you are looking for? Try asking Jeves.'
		]
	}
};
```

##Build configuration
The better way to configure cliplet is to build the configuration into the bookmarklet. In order to do so, you must have node and npm installed.

After node and npm are installed clone this repository.

```bash
git clone https://github.com/rstone770/cliplet.git
```

Navigate into the project folder and install the dependencies.

```bash
cd cliplet

npm install
```

After everything is installed configure the project as needed then build.
```bash
gulp
```

Your artifact will appear inside of the bin folder.

###Note
Because of the simplicity of cliplet and the revealing module type pattern used, there is not really an api. Configuration is provided as just an ability to fiddle with the defaults unless core code is changed.

##Examples
A simple example that could make clippy more useful. This can be used for both configuration types.
```javascript
cliplet.defaults.say = function (options, done) {
	$.getJSON('http://query.yahooapis.com/v1/public/yql?q=select%20%2a%20from%20yahoo.finance.quotes%20where%20symbol%20in%20%28%22GOOG%22%29&env=store://datatables.org/alltableswithkeys&format=json', function (data) {
		var quote = data.query.results.quote;

		say(quote.Name + ' Opened at ' + quote.Open  + ' and is currently at ' + quote.Ask); 
	});
};
```

This example will quote the opening and current google price at random intervals.
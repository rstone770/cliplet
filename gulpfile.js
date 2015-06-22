var gulp = require('gulp'),
    rename = require('gulp-rename'),
    template = require('gulp-template'),
    through = require('through2'),
    uglify = require('gulp-uglify'),
    pkg = require('./package');

var bookmarklet = through.obj(function (file, enc, done) {
  file.contents = new Buffer('javascript: ' + encodeURI(file.contents.toString()));

  done(null, file);
});

gulp.task('default', function () {
  var stream = gulp.src('src/cliplet.js')
    .pipe(uglify())
    .pipe(template(pkg))
    .pipe(bookmarklet)
    .pipe(rename('cliplet'))
    .pipe(gulp.dest('bin'));
});
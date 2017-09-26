/**
 Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2016-2017 Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

'use strict'

var gulp = require('gulp')
var pump = require('pump')
var htmlmin = require('gulp-htmlmin')
const jsdoc = require('gulp-jsdoc3')
const clean = require('gulp-clean')

gulp.task('default', function () {
  // place code for your default task here
})

gulp.task('docs', ['doc', 'docIcons', 'docImages', 'docExamples'])
gulp.task('build', ['web', 'nodejs'])
// gulp.task('publish', ['build', 'icons', 'images', 'examples', 'locale', 'docs'])
gulp.task('publish', ['build', 'icons', 'images', 'examples', 'locale'])

gulp.task('clean', function () {
  return gulp.src('modbus')
    .pipe(clean({force: true}))
})

gulp.task('doc', function (cb) {
  gulp.src(['README.md', 'src/**/*.js'], {read: false})
    .pipe(jsdoc(cb))
})

gulp.task('docIcons', function () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('docs/gen/icons'))
})

gulp.task('docImages', function () {
  return gulp.src('images/**/*').pipe(gulp.dest('docs/gen/images'))
})

gulp.task('docExamples', function () {
  return gulp.src('examples/**/*').pipe(gulp.dest('docs/gen/examples'))
})

gulp.task('icons', function () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('modbus/icons'))
})

gulp.task('images', function () {
  return gulp.src('images/**/*').pipe(gulp.dest('modbus/images'))
})

gulp.task('examples', function () {
  return gulp.src('examples/**/*').pipe(gulp.dest('modbus/examples'))
})

gulp.task('locale', function () {
  return gulp.src('src/locales/**/*').pipe(gulp.dest('modbus/locales'))
})

gulp.task('web', function () {
  return gulp.src('src/*.htm*')
    .pipe(htmlmin({
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
      maxLineLength: 120,
      preserveLineBreaks: false,
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      conservativeCollapse: true,
      processScripts: ['text/x-red'],
      quoteCharacter: "'"
    }))
    .pipe(gulp.dest('modbus'))
})

gulp.task('nodejs', function (cb) {
  pump([
    gulp.src('src/**/*.js'),
    gulp.dest('modbus')
  ],
    cb
  )
})

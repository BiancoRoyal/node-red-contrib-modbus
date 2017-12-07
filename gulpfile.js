/**
 Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2016-2017 Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

'use strict'

const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const jsdoc = require('gulp-jsdoc3')
const clean = require('gulp-clean')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const sequence = require('gulp-sequence')
const sourcemaps = require('gulp-sourcemaps')
const pump = require('pump')

gulp.task('default', function () {
  // place code for your default task here
})

gulp.task('docs', sequence('doc', 'docIcons', 'docImages', 'docExamples'))
gulp.task('build', sequence('clean', 'web', 'nodejs', 'locale'))
gulp.task('publish', sequence('build', 'maps', 'icons', 'images', 'examples'))

gulp.task('clean', function () {
  return gulp.src(['modbus', 'docs/gen', 'maps'])
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

gulp.task('maps', function () {
  return gulp.src('maps/**/*').pipe(gulp.dest('modbus/maps'))
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
  pump([gulp.src('src/**/*.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel({presets: ['es2015']}))
        .pipe(uglify())
        .pipe(sourcemaps.write('maps')), gulp.dest('modbus')],
    cb
  )
})

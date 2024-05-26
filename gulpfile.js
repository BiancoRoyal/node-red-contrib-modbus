/*
 The MIT License

 Copyright (c) since the year 2017 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus
 */

const { src, dest, series } = require('gulp')
const clean = require('gulp-clean')
const jsdoc = require('gulp-jsdoc3')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const pump = require('pump')
const sourcemaps = require('gulp-sourcemaps')
const replace = require('gulp-replace')
const changelog = require('gulp-conventional-changelog')
const htmlmin = require('gulp-htmlmin')

function releaseIcons () {
  return src('src/icons/**/*').pipe(dest('modbus/icons'))
}

function docIcons () {
  return src('src/icons/**/*').pipe(dest('docs/gen/icons'))
}

function docImages () {
  return src('images/**/*').pipe(dest('docs/gen/images'))
}

function releaseLocal () {
  return src('src/locales/**/*').pipe(dest('modbus/locales'))
}

function cleanProject () {
  return src(['modbus', 'docs/gen', 'jcoverage', 'coverage', 'code', '.nyc_output'], { allowEmpty: true })
    .pipe(clean({ force: true }))
}

function changelogUpdate () {
  return src('CHANGELOG.md')
    .pipe(changelog({
      // conventional-changelog options go here
      preset: 'angular',
      releaseCount: 0
    }, {
      // context goes here
    }, {
      // git-raw-commits options go here
    }, {
      // conventional-commits-parser options go here
    }, {
      // conventional-changelog-writer options go here
    }))
    .pipe(dest('./'))
}

function releaseWebContent () {
  return src('src/*.htm*')
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
    .pipe(dest('modbus'))
}

function releaseJSContent (cb) {
  const anchor = '// SOURCE-MAP-REQUIRED'

  pump([
    src('src/**/*.js')
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(replace(anchor, 'require(\'source-map-support\').install()'))
      .pipe(babel({ presets: ['@babel/env'] }))
      .pipe(uglify())
      .pipe(sourcemaps.write('maps')), dest('modbus')],
  cb)
}

function codeJSContent (cb) {
  const anchor = '// SOURCE-MAP-REQUIRED'

  pump([
    src('src/**/*.js')
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(replace(anchor, 'require(\'source-map-support\').install()'))
      .pipe(babel({ presets: ['@babel/env'] }))
      .pipe(sourcemaps.write('maps')), dest('code')],
  cb)
}

function doc (cb) {
  src(['README.md', 'src/**/*.js'], { read: false })
    .pipe(jsdoc(cb))
}

exports.default = series(cleanProject, releaseWebContent, releaseJSContent, codeJSContent, releaseLocal, releaseIcons, doc, docIcons, docImages, changelogUpdate)
exports.clean = cleanProject
exports.build = series(cleanProject, releaseWebContent, releaseJSContent, releaseLocal, codeJSContent)
exports.buildDocs = series(doc, docIcons, docImages)
exports.changelog = changelogUpdate
exports.publish = series(cleanProject, releaseWebContent, releaseJSContent, releaseLocal, codeJSContent, releaseIcons, doc, docIcons, docImages, changelogUpdate)

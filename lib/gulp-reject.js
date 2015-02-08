'use strict';

//var through = require('through2'),
//    multimatch = require('multimatch');
//
//var path = require('path');
//
//module.exports = function (pattern) {
//
//    return through.obj(function (file, enc, callback) {
//
//        //console.log(file.path);
//        //console.log(file.cwd);
//        //console.log(file.base);
//        //console.log();
//
//        //file.contents = new Buffer(result);
//
//        var self = this;
//
//
//        if (path.extname(file.path) === '.css') {
//            setTimeout(function () {
//                self.push(file);
//            }, 1000);
//        } else {
//            self.push(file);
//        }
//        callback();
//    });
//
//};

//var gulp = require('gulp'),
//    through2 = require('through2'),
//    markdown = require('gulp-markdown'),
//    _ = require('underscore'),
//    fs = require('fs');
//
//var template = '';
//template = fs.readFileSync('./template.jst');
//
//function templatize() {
//    return through2.obj(function (file, enc, callback) {
//        //console.log(file.contents.toString(enc));
//
//        var compiled = _.template(template.toString('utf8'));
//
//        var result = compiled({
//            content: file.contents.toString(enc)
//        });
//
//        file.contents = new Buffer(result);
//
//        this.push(file);
//        callback();
//    });
//}
//
//gulp.task('default', function () {
//
//    gulp.src('javascript-101.md')
//        .pipe(markdown())
//        .pipe(templatize())
//        .pipe(gulp.dest('./'));
//
//});
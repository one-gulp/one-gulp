'use strict';

var path = require('path');

var gulp = require('gulp'),
    filter = require('gulp-filter');

var _ = require('./underscore-mixins.js');

function allGlobs(exts) {

    return _([exts]).chain()
        .flatten()
        .map(ext => '**/*.' + ext)
        .value();
}

module.exports = {

    fromExts(dir, exts) {
        return gulp.src(allGlobs(exts), {
            cwd: path.resolve(dir),
            base: path.resolve(dir),
            nodir: true
        });
    },

    notFromExts(dir, exts) {
        return gulp.src('**/*', {
            cwd: path.resolve(dir),
            base: path.resolve(dir),
            nodir: true
        })
            .pipe(filter(allGlobs(exts), { base: dir }));
    }
};
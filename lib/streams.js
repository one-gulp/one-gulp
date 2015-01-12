'use strict';

var path = require('path');

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    bower = require('main-bower-files');

var _ = require('./underscore-mixins.js');

function allGlobs(exts) {

    return _(exts).chain()
        .flatten()
        .map(function (ext) {
            return '**/*.' + ext;
        })
        .value();
}

function depToStream(glob, read, src) {

    return gulp.src(glob, {
        read: read,
        nodir: true,
        cwd: path.resolve(src),
        base: path.resolve(src)
    });
}

function depToFilteredAndSortedStream(dep, read, src) {

    var stream;

    if (dep.bowerInclude) {
        stream = gulp.src(bower({ filter: dep.bowerInclude }), {
            read: read,
            nodir: true,
            cwd: path.resolve('.'),
            base: path.resolve('bower_components')
        });
    }

    if (dep.srcInclude) {
        stream = depToStream(dep.srcInclude, read, src);
    }

    if (dep.exclude) {
        stream = stream.pipe($.filter(dep.exclude));
    }

    if (dep.sort) {
        stream = stream.pipe($.order(dep.sort));
    }

    return stream;
}

function depToOutputStream(dep, read, src, allOutputs) {

    if (dep.output) {

        return depToStream(dep.output, read, src);
    }
    else {

        return depToFilteredAndSortedStream(dep, read, src)
            .pipe($.filter(allOutputs));
    }
}

module.exports = function (options) {

    return {

        fromExts: function (dir, exts) {
            return gulp.src(allGlobs(exts), { cwd: dir, nodir: true });
        },

        notFromExts: function (dir, exts) {

            return gulp.src('**/*', { cwd: dir, nodir: true })
                .pipe($.filter(allGlobs(exts), { base: dir }));
        },

        fromDeps: function (dir, deps) {

            return _(deps).chain()
                .flatten()
                .map(function (dep) {
                    return depToFilteredAndSortedStream(dep, false, dir);
                })
                .mergeStreams()
                .value();
        },

        fromOutputDeps: function (dir, deps) {

            var allOutputs = _(deps).chain()
                .flatten()
                .pluck('output')
                .compact()
                .value();

            return _(deps).chain()
                .flatten()
                .map(function (dep) {
                    return depToOutputStream(dep, false, dir, allOutputs);
                })
                .mergeStreams()
                .value();
        },

        concatAndMinify: function (params) {

            return _(params.deps).chain()
                .map(function (dep) {

                    var stream = depToFilteredAndSortedStream(dep, true, options.preprocess);

                    return {
                        stream: stream,
                        output: dep.output
                    };
                })
                .groupBy('output')
                .map(function (objects, output) {

                    var sourceStream = _(objects).chain()
                        .pluck('stream')
                        .mergeStreams()
                        .value();

                    if (output !== 'undefined') {
                        sourceStream = sourceStream.pipe(params.concatFn(output));
                    }

                    return sourceStream;
                })
                .mergeStreams()
                .value()
                .pipe(params.minifyFn())
                .pipe(gulp.dest(options.prod));
        }
    };
};
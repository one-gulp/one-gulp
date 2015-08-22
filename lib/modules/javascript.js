'use strict';

module.exports = function (one) {

    one.defaultOptions.javascript = {
        src: null,
        exts: ['js'],
        deps: [
            {
                include: ['bower_components/**/*.js'],
                output: 'bower-scripts.js'
            },
            {
                include: ['**/*.js'],
                exclude: ['bower_components/**/*.js'],
                output: 'all-scripts.js'
            }
        ],
        minify: {}
    };

    one.sources.javascript = () =>
        one.src.fromExts(one.options.javascript.src || one.options.src, one.options.javascript.exts);

    one.transforms.javascript = {
        minify: js => {
            let uglify = require('gulp-uglify');

            return js.pipe(uglify(one.options.javascript.minify));
        },

        sortByDepth: js => one.transforms.common.sortByDepth(js),

        concat: js => {
            let concat = require('gulp-concat');

            return one.transforms.common.concat(js, one.options.javascript.deps, concat);
        }
    };
};
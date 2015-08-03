'use strict';

module.exports = function (one) {

    one.defaultOptions.css = {
        exts: ['css'],
        deps: [
            {
                include: ['bower_components/**/*.css'],
                output: 'bower-styles.css'
            },
            {
                include: ['**/*.css'],
                exclude: ['bower_components/**/*.css'],
                output: 'all-styles.css'
            }
        ],
        autoprefix: {},
        minify: {}
    };

    one.sources.css = () =>
        one.src.fromExts(one.options.src, one.options.css.exts);

    one.transforms.css = {
        autoprefix: css => {
            let autoprefixer = require('gulp-autoprefixer');

            return css.pipe(autoprefixer(one.options.css.autoprefix));
        },

        minify: css => {
            let minifyCss = require('gulp-minify-css');

            return css.pipe(minifyCss(one.options.css.minify));
        },

        sortByDepth: css => {
            return one.transforms.common.sortByDepth(css)
        },

        concat: css => {
            let concatCss = require('gulp-concat-css');

            return one.transforms.common.concat(css, one.options.css.deps, concatCss);
        }
    };
};
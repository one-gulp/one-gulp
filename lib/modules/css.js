'use strict';

module.exports = function (one) {

    one.defaultOptions.css = {
        src: null,
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
        one.src.fromExts(one.options.css.src || one.options.src, one.options.css.exts);

    one.transforms.css = {
        autoprefix: css => {
            let autoprefixer = require('gulp-autoprefixer');

            return css
                .pipe(one.cache.cached('css.autoprefix'))
                .pipe(autoprefixer(one.options.css.autoprefix))
                .pipe(one.cache.remember('css.autoprefix'));
        },

        minify: css => {
            let minifyCss = require('gulp-minify-css');

            return css
                .pipe(one.cache.cached('css.minify'))
                .pipe(minifyCss(one.options.css.minify))
                .pipe(one.cache.remember('css.minify'));
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
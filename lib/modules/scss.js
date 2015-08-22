'use strict';

module.exports = function (one) {

    one.defaultOptions.scss = {
        src: null,
        exts: ['scss'],
        preprocess: {
            includePaths: [one.options.src]
        }
    };

    one.sources.scss = () =>
        one.src.fromExts(one.options.scss.src || one.options.src, one.options.scss.exts);

    one.transforms.scss = {
        preprocess: scss => {
            var notify = require('gulp-notify'),
                plumber = require('gulp-plumber'),
                sass = require('gulp-sass');

            return scss
                .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
                .pipe(sass(one.options.scss.preprocess));
        }
    };
};
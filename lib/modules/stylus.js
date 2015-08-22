'use strict';

module.exports = function (one) {

    one.defaultOptions.stylus = {
        src: null,
        exts: ['styl'],
        preprocess: {}
    };

    one.sources.stylus = () =>
        one.src.fromExts(one.options.stylus.src || one.options.src, one.options.stylus.exts);

    one.transforms.stylus = {
        preprocess: styl => {
            let stylus = require('gulp-stylus');

            return styl
                .pipe(one.cache.cached('stylus.preprocess'))
                .pipe(stylus(one.options.stylus.preprocess))
                .pipe(one.cache.remember('stylus.preprocess'));
        }
    };
};
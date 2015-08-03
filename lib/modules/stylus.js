'use strict';

module.exports = function (one) {

    one.defaultOptions.stylus = {
        exts: ['styl'],
        preprocess: {}
    };

    one.sources.stylus = () =>
        one.src.fromExts(one.options.src, one.options.stylus.exts);

    one.transforms.stylus = {
        preprocess: styl => {
            let stylus = require('gulp-stylus');

            return styl.pipe(stylus(one.options.stylus.preprocess));
        }
    };
};
'use strict';

module.exports = function (one) {

    one.defaultOptions.less = {
        exts: ['less'],
        preprocess: {}
    };

    one.sources.less = () =>
        one.src.fromExts(one.options.src, one.options.less.exts);

    one.transforms.less = {
        preprocess: less => {
            let gulpLess = require('gulp-less');

            return less.pipe(gulpLess(one.options.less.preprocess));
        }
    };
};
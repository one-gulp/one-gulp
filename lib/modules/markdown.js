'use strict';

module.exports = function (one) {

    one.defaultOptions.markdown = {
        exts: ['md'],
        preprocess: {}
    };

    one.sources.markdown = () =>
        one.src.fromExts(one.options.src, one.options.markdown.exts);

    one.transforms.markdown = {
        preprocess: md => {
            let markdown = require('gulp-markdown');

            return md.pipe(markdown(one.options.markdown.preprocess));
        }
    };
};
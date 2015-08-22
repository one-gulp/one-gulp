'use strict';

module.exports = function (one) {

    one.defaultOptions.markdown = {
        src: null,
        exts: ['md'],
        preprocess: {}
    };

    one.sources.markdown = () =>
        one.src.fromExts(one.options.markdown.src || one.options.src, one.options.markdown.exts);

    one.transforms.markdown = {
        preprocess: md => {
            let markdown = require('gulp-markdown');

            return md
                .pipe(one.cache.cached('markdown.preprocess'))
                .pipe(markdown(one.options.markdown.preprocess))
                .pipe(one.cache.remember('markdown.preprocess'));
        }
    };
};
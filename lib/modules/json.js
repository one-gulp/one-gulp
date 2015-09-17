'use strict';

module.exports = function (one) {

    one.defaultOptions.json = {
        src: null,
        exts: ['json'],
        minify: {}
    };

    one.sources.json = () =>
        one.src.fromExts(one.options.json.src || one.options.src, one.options.json.exts);

    one.transforms.json = {

        minify: json => {
            let jsonminify = require('gulp-jsonminify');

            return json
                .pipe(one.cache.cached('json.minify'))
                .pipe(jsonminify(one.options.json.minify))
                .pipe(one.cache.remember('json.minify'));
        }
    };
};
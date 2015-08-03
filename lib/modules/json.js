'use strict';

module.exports = function (one) {

    one.defaultOptions.json = {
        exts: ['json'],
        minify: {}
    };

    one.sources.json = () =>
        one.src.fromExts(one.options.src, one.options.json.exts);

    one.transforms.json = {

        minify: json => {
            let jsonminify = require('gulp-jsonminify');

            json.pipe(jsonminify(one.options.json.minify));
        }
    };
};
'use strict';

module.exports = function (one) {

    one.defaultOptions.typescript = {
        src: null,
        exts: ['ts'],
        preprocess: {
            noExternalResolve: true
        }
    };

    one.sources.typescript = () =>
        one.src.fromExts(one.options.typescript.src || one.options.src, one.options.typescript.exts);

    one.transforms.typescript = {
        preprocess: ts => {
            let sourcemaps = require('gulp-sourcemaps'),
                typescript = require('gulp-typescript');

            return ts
                .pipe(sourcemaps.init())
                .pipe(typescript())
                .js
                .pipe(sourcemaps.write({ sourceRoot: '/src' }));
        }
    };
};
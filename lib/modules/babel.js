'use strict';

module.exports = function (one) {

    one.transforms.babel = {

        preprocess: js => {
            let sourcemaps = require('gulp-sourcemaps'),
                babel = require('gulp-babel');

            return js
                .pipe(one.cache.cached('babel.preprocess'))
                .pipe(sourcemaps.init())
                .pipe(babel())
                .pipe(sourcemaps.write({ sourceRoot: '/src' }))
                .pipe(one.cache.remember('babel.preprocess'));
        }
    };
};
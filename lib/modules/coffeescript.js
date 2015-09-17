'use strict';

module.exports = function (one) {

    one.defaultOptions.coffeescript = {
        src: null,
        exts: ['coffee'],
        preprocess: {}
    };

    one.sources.coffeescript = () =>
        one.src.fromExts(one.options.coffeescript.src || one.options.src, one.options.coffeescript.exts);

    one.transforms.coffeescript = {
        preprocess: coffee => {
            let sourcemaps = require('gulp-sourcemaps'),
                gulpCoffee = require('gulp-coffee');

            return coffee
                .pipe(one.cache.cached('coffee.preprocess'))
                .pipe(sourcemaps.init())
                .pipe(gulpCoffee())
                .pipe(sourcemaps.write({ sourceRoot: '/src' }))
                .pipe(one.cache.remember('coffee.preprocess'));
        }
    };
};

'use strict';

module.exports = function (one) {

    one.defaultOptions.coffeescript = {
        exts: ['coffee'],
        preprocess: {}
    };

    one.sources.coffeescript = () =>
        one.src.fromExts(one.options.src, one.options.coffeescript.exts);

    one.transforms.coffeescript = {
        preprocess: coffee => {
            let sourcemaps = require('gulp-sourcemaps'),
                gulpCoffee = require('gulp-coffee');

            return coffee
            .pipe(sourcemaps.init())
            .pipe(gulpCoffee())
            .pipe(sourcemaps.write({ sourceRoot: '/src' }));
        }
    };
};

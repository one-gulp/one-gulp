'use strict';

module.exports = function (one) {

    one.defaultOptions.jade = {
        src: null,
        exts: ['jade'],
        preprocess: {
            pretty: true
        }
    };

    one.sources.jade = () =>
        one.src.fromExts(one.options.jade.src || one.options.src, one.options.jade.exts);

    one.transforms.jade = {
        preprocess: jade => {
            let gulpJade = require('gulp-jade');

            return jade
                .pipe(one.cache.cached('jade.preprocess'))
                .pipe(gulpJade(one.options.jade.preprocess))
                .pipe(one.cache.remember('jade.preprocess'));
        }
    };
};
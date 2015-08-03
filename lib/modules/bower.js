'use strict';

module.exports = function (one) {

    one.defaultOptions.bower = {
        filters: {
            css: '**/*.css',
            js: '**/*.js'
        },
        dir: 'bower_components'
    };

    function makeBowerSource (filter) {
        let bower = require('main-bower-files'),
            fs = require('fs'),
            path = require('path');

        if (fs.existsSync('./bower.json')) {
            return one.gulp.src(bower({ filter: filter }), {
                nodir: true,
                cwd: path.resolve('.'),
                base: path.resolve(one.options.bower.dir)
            });
        }
        else {
            return gulp.src('');
        }
    }

    one.sources.bower = {
        css: () => makeBowerSource(one.options.bower.filters.css),
        js: () => makeBowerSource(one.options.bower.filters.js)
    }
};
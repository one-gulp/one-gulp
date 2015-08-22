'use strict';

module.exports = function (one) {

    one.defaultOptions.svg = {
        exts: ['svg'],
        rename: {},
        minify: {
            inlineSvg: true
        },
        preprocess: {
            includePaths: [one.options.src]
        }
    };

    one.sources.svg = () =>
        one.src.fromExts(one.options.src, one.options.svg.exts);

    one.transforms.svg = {
        rename: svg => {
            let rename = require('gulp-rename');

            return svg.pipe(rename(one.options.svg.rename));
        },
        minify: svg => {
            let svgstore = require('gulp-svgstore'),
                svgmin = require('gulp-svgmin');

            return svg
                .pipe(svgmin())
                .pipe(svgstore(one.options.svg.minify));
        },
        inject: function (html, svgs) {
            let inject = require('gulp-inject');

            return html.pipe(inject(svgs, {
                transform: function fileContents(filePath, file) {
                    return file.contents.toString();
                }
            }));
        }
    };
};
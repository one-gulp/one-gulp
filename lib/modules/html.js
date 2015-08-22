'use strict';

module.exports = function (one) {

    one.defaultOptions.html = {
        src: null,
        exts: ['html'],
        minify: {
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeCDATASectionsFromCDATA: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            preserveLineBreaks: false,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true,
            removeIgnored: false,
            removeEmptyElements: false,
            lint: false,
            keepClosingSlash: false,
            caseSensitive: true,
            minifyJS: false,
            minifyCSS: false,
            minifyURLs: false
        }
    };

    one.sources.html = () =>
        one.src.fromExts(one.options.html.src || one.options.src, one.options.html.exts);

    one.transforms.html = {
        minify: html => {
            let htmlmin = require('gulp-htmlmin');

            return html
                .pipe(one.cache.cached('html.minify'))
                .pipe(htmlmin(one.options.html.minify))
                .pipe(one.cache.remember('html.minify'));
        }
    };
};
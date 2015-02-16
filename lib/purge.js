'use strict';

var path = require('path');

var rimraf = require('rimraf');

var _ = require('./underscore-mixins.js');

module.exports = function (options) {

    function replaceExts(path) {
        return path
            .replace(new RegExp('(' + options.exts.preprocessHtml.join('|') + ')$'), 'html')
            .replace(new RegExp('(' + options.exts.preprocessCss.join('|') + ')$'), 'css')
            .replace(new RegExp('(' + options.exts.preprocessJs.join('|') + ')$'), 'js');
    }

    function srcToDest(path, src, dest) {
        return replaceExts(path).replace(src, dest);
    }

    return {

        fromCaches: function (filePath, caches) {

            _(caches).forEach(function (cache) {
                delete cache[path.resolve(filePath)];
                delete cache[path.resolve(srcToDest(filePath, options.src, options.dev))];
            });
        },

        fromFileSystem: function (filePath) {
            rimraf.sync(srcToDest(filePath, options.src, options.dev));
        }
    };
};
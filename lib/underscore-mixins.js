'use strict';

var _ = require('underscore'),
    merge = require('ordered-merge-stream');

module.exports = _;

_.mixin({

    concat: function (array, items) {
        return array.concat(items);
    },

    mergeStreams: function (streamsArray) {
        _(streamsArray).invoke('pause');
        return merge(streamsArray);
    },

    remove: function (array, element) {

        var elementIndex = array.indexOf(element);

        if (elementIndex !== -1) {
            array.splice(elementIndex, 1);
        }

    },

    hasExt: function (path, exts) {

        var exts = _(arguments).chain()
            .rest()
            .flatten()
            .value()
            .join('|');

        return path.match(new RegExp('\\.(?:' + exts + ')$')) != null;
    }

});

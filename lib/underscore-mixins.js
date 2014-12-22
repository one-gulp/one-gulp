'use strict';

var _ = require('underscore'),
    merge = require('merge-stream');

module.exports = _;

_.mixin({

    concat: function (array, items) {
        return array.concat(items);
    },

    mergeStreams: function (streamsArray) {
        return merge.apply(null, streamsArray);
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

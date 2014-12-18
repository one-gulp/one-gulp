'use strict';

var _ = require('underscore'),
    merge = require('./concat-vinyl-streams.js');

module.exports = _;

_.mixin({

    concat: function (array, items) {
        return array.concat(items);
    },

    concatVinylStreams: function (streamsArray) {
        return merge(streamsArray);
    },

    remove: function (array, element) {

        var elementIndex = array.indexOf(element);

        if (elementIndex !== -1) {
            array.splice(elementIndex, 1);
        }

    }

});

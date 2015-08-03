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
    },

    deepExtend: function (obj) {
        var parentRE = /#{\s*?_\s*?}/,
        slice = Array.prototype.slice;

        _(slice.call(arguments, 1)).each(function(source) {

            for (var prop in source) {

                if (_.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop])) {
                    obj[prop] = source[prop];
                }
                else if (_.isArray(obj[prop]) || _.isString(obj[prop]) || _.isNumber(obj[prop])) {
                    // Nothing to do
                } else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
                    if (_.isString(obj[prop])) {
                        obj[prop] = source[prop].replace(parentRE, obj[prop]);
                    }
                }
                else if (_.isObject(obj[prop]) || _.isObject(source[prop])) {
                    if (!_.isObject(obj[prop]) || !_.isObject(source[prop])) {
                        throw new Error('Trying to combine an object with a non-object (' + prop + ')');
                    } else {
                        obj[prop] = _.deepExtend(_.clone(obj[prop]), source[prop]);
                    }
                }
                else {
                    obj[prop] = source[prop];
                }
            }
        });

        return obj;
    }

});

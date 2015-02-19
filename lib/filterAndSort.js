'use strict';

var path = require('path');

var through2 = require('through2'),
    minimatch = require('minimatch'),
    multimatch = require('multimatch');

var _ = require('./underscore-mixins.js');

module.exports = function (dep) {

    var filteredAndSorted = dep.include.map(inc => []);

    return through2.obj(
        function (chunk, enc, callback) {

            var relativeToCwd = path.relative(chunk.cwd, chunk.path);

            dep.include.forEach((include, includeIdx) => {

                if (minimatch(relativeToCwd, include)) {
                    if (dep.exclude == null || multimatch(relativeToCwd, dep.exclude).length === 0) {
                        filteredAndSorted[includeIdx].push(chunk);
                    }
                }
            });

            callback();
        },
        function (callback) {

            _(filteredAndSorted).chain()
                .flatten()
                .unique()
                .forEach(file => {
                    this.push(file);
                });

            callback();
        }
    );
};
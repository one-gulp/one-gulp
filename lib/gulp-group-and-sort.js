'use strict';

var path = require('path');

var through2 = require('through2'),
    minimatch = require('minimatch'),
    multimatch = require('multimatch');

var _ = require('./underscore-mixins.js');

module.exports = function (deps) {

    var files = _(deps).map(() => []);

    return through2.obj(function (chunk, enc, callback) {

            console.log(chunk.relative);
            console.log('  ', chunk.base);
            console.log('  ', chunk.cwd);
            console.log('  ', chunk.history);

            //_(deps).forEach(function (dep, i) {
            //
            //    if (dep.srcInclude != null && chunk.base === src) {
            //
            //        if (multimatch(chunk.relative, dep.srcInclude).length > 0) {
            //
            //            if (dep.exclude == null || multimatch(chunk.relative, dep.exclude).length === 0) {
            //                files[i].push(chunk);
            //            }
            //        }
            //    }
            //
            //    if (dep.bowerInclude != null && chunk.base === bower) {
            //
            //        if (multimatch(chunk.relative, dep.bowerInclude).length > 0) {
            //
            //            if (dep.exclude == null || multimatch(chunk.relative, dep.exclude).length === 0) {
            //                files[i].push(chunk);
            //            }
            //        }
            //    }
            //});

            callback();
        },
        function (cb) {

            console.log('');

            _(files).chain()
                .map((group, idx) => {

                    if (deps[idx].sort == null) {
                        return group;
                    }
                    else {

                        return _(group).sortBy(file => {
                            var findIndex = deps[idx].sort.findIndex(function (pattern) {
                                return minimatch(file.relative, pattern);
                            });
                            return findIndex === -1 ? deps[idx].sort.length : findIndex;
                        });
                    }

                })
                .flatten()
                .forEach(file => {
                    console.log(file.path);
                    this.push(file);
                });

            cb();
        });
};
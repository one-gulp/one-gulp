'use strict';

module.exports = function (one, _) {

    one.transforms.common = {
        sortByDepth: files => {
            let sort = require('gulp-sort'),
                path = require('path');

            return files.pipe(sort((fileA, fileB) => {

                var depthA = fileA.path.split(path.sep).length,
                    depthB = fileB.path.split(path.sep).length;

                if (depthA > depthB) {
                    return 1;
                }
                if (depthA < depthB) {
                    return -1;
                }

                if (fileA.path > fileB.path) {
                    return 1;
                }
                if (fileA.path < fileB.path) {
                    return -1;
                }

                return 0;
            }))
        },

        concat: (fileType, deps, concatMethod) => {
            let filterAndSort = require('../filter-and-sort.js');

            return _(deps).chain()
                .map(dep => {

                    return fileType
                        .pipe(filterAndSort(dep))
                        .pipe(concatMethod(dep.output));
                })
                .concatVinylStreams()
                .value();
        },
    };
};
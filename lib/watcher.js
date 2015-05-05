'use strict';


var mkdirp = require('mkdirp'),
    chokidar = require('chokidar');

var loggers = require('./loggers.js');

exports.watch = function (paths, callback) {

    function logAndCallback(loggedEvent) {

        return (path) => {

            if (path.match(/___jb_bak___$/) == null &&
                path.match(/___jb_old___$/) == null &&
                path.match(/\.swp$/) == null) {

                loggers.watcher(loggedEvent, path);

                callback();
            }
        }
    }

    loggers.watcher('watching', paths);

    chokidar.watch(paths, { persistent: true, ignoreInitial: true })
        .on('add', logAndCallback('add'))
        .on('change', logAndCallback('updated'))
        .on('unlink', logAndCallback('delete'))
        .on('unlinkDir', logAndCallback('delete dir'));
};

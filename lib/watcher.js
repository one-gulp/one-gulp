'use strict';


var mkdirp = require('mkdirp'),
    chokidar = require('chokidar');

var loggers = require('./loggers.js');

exports.watch = function (paths, callback) {

    function logAndCallback(eventName, loggedEvent) {

        return (path) => {

            if (path.match(/___jb_bak___$/) == null &&
                path.match(/___jb_old___$/) == null &&
                path.match(/\.swp$/) == null) {

                loggers.watcher(loggedEvent, path);

                callback(eventName, path);
            }
        }
    }

    loggers.watcher('watching', paths);

    chokidar.watch(paths, { persistent: true, ignoreInitial: true })
        .on('add', logAndCallback('add', 'add'))
        .on('change', logAndCallback('change', 'updated'))
        .on('unlink', logAndCallback('unlink', 'delete'))
        .on('unlinkDir', logAndCallback('unlinkDir', 'delete dir'));
};

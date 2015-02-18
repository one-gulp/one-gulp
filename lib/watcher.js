'use strict';


var mkdirp = require('mkdirp'),
    chokidar = require('chokidar');

var loggers = require('./loggers.js');

exports.watch = function (dir, listeners) {

    function logAndBind(event, loggedEvent) {

        return function (path) {

            if (path.match(/___jb_bak___$/) == null &&
                path.match(/___jb_old___$/) == null &&
                path.match(/\.swp$/) == null) {

                loggers.watcher(loggedEvent, path);

                if (listeners[event]) {
                    listeners[event](path);
                }
            }
        }
    }

    loggers.watcher('watching', dir);

    mkdirp.sync(dir);

    chokidar.watch(dir, { persistent: true, ignoreInitial: true })
        .on('add', logAndBind('add', 'add'))
        .on('change', logAndBind('change', 'updated'))
        .on('unlink', logAndBind('unlink', 'delete'))
        .on('unlinkDir', logAndBind('unlinkDir', 'delete dir'));
};

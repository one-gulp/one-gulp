'use strict';

var connect = require('connect'),
    serveStatic = require('serve-static'),
    browserSync = require('browser-sync');

var _ = require('./underscore-mixins.js'),
    loggers = require('./loggers.js');

exports.startStatic = function (options) {

    var app = connect();

    _(options.mounts).forEach(function (path) {
        app.use('/' + path, serveStatic(path));
    });

    _(options.paths).forEach(function (path) {
        app.use(serveStatic(path));
    });

    app.listen(options.port, options.host);

    loggers.server('static', options.host, options.port);
};

exports.startBrowserSync = function (options) {

    browserSync({
        proxy: 'localhost:' + options.proxyPort,
        port: options.port,
        open: false,
        notify: false,
        logLevel: 'silent'
    });

    loggers.server('BrowserSync', options.host, options.port);
};

exports.reloadBrowserSync = (function () {

    var idx,
        paths = [];

    return function (path) {

        clearTimeout(idx);

        paths = _(paths).chain()
            .concat(path)
            .unique()
            .value();

        idx = setTimeout(function () {

            if (_(paths).isEmpty()) {
                browserSync.reload();
                loggers.browserSyncReload('ALL');
            }
            else {
                browserSync.reload(paths);
                loggers.browserSyncReload(paths);
                paths = [];
            }

        }, 100);
    }
})();
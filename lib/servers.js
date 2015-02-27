'use strict';

var connect = require('connect'),
    serveStatic = require('serve-static'),
    browserSync = require('browser-sync'),
    through2 = require('through2');

var _ = require('./underscore-mixins.js'),
    loggers = require('./loggers.js');

module.exports = {

    startStatic(options) {

        var app = connect();

        app.use('/' + options.bowerDir, serveStatic(options.bowerDir));

        _([options.dev, options.src]).forEach(function (path) {
            app.use(serveStatic(path));
        });

        app.listen(options.connectPort, options.bindHost);

        loggers.server('static', options.bindHost, options.connectPort);
    },

    startBrowserSync(options) {

        browserSync({
            proxy: 'localhost:' + options.connectPort,
            port: options.browserSyncPort,
            open: false,
            notify: false,
            logLevel: 'silent',
            ui: {
                port: options.browserSyncUiPort,
                weinre: {
                    port: options.weinrePort
                }
            }
        });

        loggers.server('BrowserSync', options.bindHost, options.browserSyncPort);
        loggers.server('BrowserSync (conf)', options.bindHost, options.browserSyncUiPort);
        loggers.server('weinre', options.bindHost, options.weinrePort);
    },

    reloadBrowserSync() {

        var paths = [];

        return through2.obj(function (file, enc, callback) {

            paths.push(file.path);
            this.push(file);
            callback();

        }, (callback) => {

            if (browserSync.active && _(paths).size() > 0) {
                browserSync.reload(paths);
                loggers.browserSyncReload(paths);
            }

            callback();
        });
    }
};
'use strict';

var connect = require('connect'),
    serveStatic = require('serve-static'),
    browserSync = require('browser-sync');

var _ = require('./underscore-mixins.js'),
    loggers = require('./loggers.js');

var timeoutId,
    reloadPaths = [];

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

    reloadBrowserSync(path) {

        clearTimeout(timeoutId);

        reloadPaths = _(reloadPaths).chain()
            .concat(path)
            .unique()
            .value();

        timeoutId = setTimeout(function () {

            if (_(reloadPaths).isEmpty()) {
                browserSync.reload();
                loggers.browserSyncReload('ALL');
            }
            else {
                browserSync.reload(reloadPaths);
                loggers.browserSyncReload(reloadPaths);
                reloadPaths = [];
            }

        }, 100);
    }

};
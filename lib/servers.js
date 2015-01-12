'use strict';

var connect = require('connect'),
    serveStatic = require('serve-static'),
    browserSync = require('browser-sync');

var _ = require('./underscore-mixins.js'),
    loggers = require('./loggers.js');

module.exports = function (options) {

    var timeoutId,
        reloadPaths = [];

    return {

        startStatic: function () {

            var app = connect();

            app.use('/' + options.bowerDirectory, serveStatic(options.bowerDirectory));

            _([options.dev, options.preprocess, options.src]).forEach(function (path) {
                app.use(serveStatic(path));
            });

            app.listen(options.connectPort, options.bindHost);

            loggers.server('static', options.bindHost, options.connectPort);
        },

        startBrowserSync: function () {

            browserSync({
                proxy: 'localhost:' + options.connectPort,
                port: options.browserSyncPort,
                open: false,
                notify: false,
                logLevel: 'silent'
            });

            loggers.server('BrowserSync', options.bindHost, options.browserSyncPort);
        },

        reloadBrowserSync: function (path) {

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

};
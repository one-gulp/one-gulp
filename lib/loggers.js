'use strict';

var chalk = require('chalk'),
    moment = require('moment');

function getColoredTime() {
    return '[' + chalk.grey(moment().format('HH:mm:ss')) + ']';
}

function pad(str, howMuchSpaces) {
    return (str + new Array(howMuchSpaces + 1).join(' ')).substr(0, howMuchSpaces);
}

exports.server = function (type, host, port) {

    type = chalk.blue.bold(pad(type, 11));
    host = chalk.magenta(host);
    port = chalk.magenta(port);

    console.log(getColoredTime(), 'server:', type, 'on', host + ':' + port);
};

exports.browserSyncReload = function (paths) {

    paths = paths.join(', ');
    paths = chalk.magenta(paths);

    console.log(getColoredTime(), 'reload:', chalk.blue.bold('BrowserSync'), 'on', paths);
};

exports.watcher = function (event, path) {

    event = chalk.yellow.bold(pad(event, 10));
    path = chalk.magenta(path);

    console.log(getColoredTime(), 'watcher:', event, path);
};
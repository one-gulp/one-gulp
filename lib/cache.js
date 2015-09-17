'use strict';

let cached = require('gulp-cached'),
    remember = require('gulp-remember');

exports.cached = cached;
exports.remember = remember;

exports.forget = function (path) {

    for (let cacheName in cached.caches) {
        if (cached.caches[cacheName][path]) {
            delete cached.caches[cacheName][path];

            if (remember.cacheFor(cacheName)) {
                remember.forget(cacheName, path);
            }
        }
    };
};

let oneCache = {};
exports.set = function (cacheName, content) {
    oneCache[cacheName] = content;
};
exports.get = function (cacheName) {
    return oneCache[cacheName];
};
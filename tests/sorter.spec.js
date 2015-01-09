'use strict';

var expect = require('expect.js');

var sorter = require('../lib/sorter.js');

describe('sorter', function () {

    describe('deepestLast(paths)', function () {

        it('should ', function () {

            // given
            var paths = [
                '/bower_components/bootstrap/dist/css/foobar.css',
                '/bower_components/bootstrap/dist/css/bootstrap.css',
                '/bower_components/normalize.css/normalize.css',
                '/main.css',
                '/bower_components/angular/foobar.js',
                '/skin/background.css',
                '/skin/colors.css',
                '/zzz.css',
                '/bower_components/angular-route/angular-route.js',
                '/bower_components/angular/angular.js',
                '/bower_components/bootstrap/dist/js/bootstrap.js',
                '/bower_components/jquery/dist/jquery.js',
                '/bower_components/underscore/underscore.js',
                '/gallery/gallery.js',
                '/index.js'
            ];
            //var paths = [
            //    '/skin/colors.css',
            //    '/main.css',
            //    '/index.js'
            //];

            // when
            var sortedPaths = sorter.deepestLast(paths);

            // then
            console.log(sortedPaths);
        });
    });
});
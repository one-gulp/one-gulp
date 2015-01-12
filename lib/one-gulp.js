'use strict';

var ppath = require('path');

var $ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    bower = require('main-bower-files');

var toArray = require('stream-to-array'),
    jf = require('jsonfile');

var _ = require('./underscore-mixins.js');

exports.init = function (gulp, options) {

    options = _(options).defaults({

        exts: {
            html: ['html'],
            toHtml: ['html', 'jade', 'md'],
            css: ['css'],
            toCss: ['css', 'scss', 'less', 'styl'],
            js: ['js'],
            toJs: ['js', 'ts', 'coffee'],
            img: ['gif', 'jpg', 'jpeg', 'png', 'svg']
        },

        src: 'src',
        dev: '.one-gulp/dev',
        preprocess: '.one-gulp/preprocess',
        prod: '.one-gulp/prod',

        bowerDirectory: 'bower_components',

        connectPort: 3001,
        browserSyncPort: 3000,
        bindHost: 'localhost',

        cssDeps: [
            {
                bowerInclude: '**/*.css',
                output: 'bower-styles.css'
            },
            {
                srcInclude: ['**/*.css'],
                output: 'all-styles.css'
            }
        ],

        jsDeps: [
            {
                bowerInclude: '**/*.js',
                output: 'bower-scripts.js'
            },
            {
                srcInclude: ['**/*.js'],
                output: 'all-scripts.js'
            }
        ]
    });

    var streams = require('./streams.js')(options),
        watcher = require('./watcher.js'),
        purge = require('./purge.js')(options),
        servers = require('./servers.js')(options);

    //////////////////////////////////////////////

    rimraf.sync(options.dev);
    rimraf.sync(options.preprocess);
    rimraf.sync(options.prod);

    //////////////////////////////////////////////

    var htmlminOptions = {
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeCDATASectionsFromCDATA: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        preserveLineBreaks: false,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeOptionalTags: true,
        removeIgnored: false,
        removeEmptyElements: false,
        lint: false,
        keepClosingSlash: false,
        caseSensitive: true,
        minifyJS: false,
        minifyCSS: false,
        minifyURLs: false
    };

    ///////////////////////////////////////////

    var startTask = _.debounce(function (task) {
        gulp.start(task);
    });

    ///////////////////////////////////////////

    ////// TO HTML

    gulp.task('preprocess/html', function () {

        return streams.fromExts(options.src, options.exts.html)
            .pipe($.cached('html', { optimizeMemory: true }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/jade', function () {

        return streams.fromExts(options.src, ['jade'])
            .pipe($.cached('jade', { optimizeMemory: true }))
            .pipe($.jade({ pretty: true }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/markdown', function () {

        return streams.fromExts(options.src, ['md'])
            .pipe($.cached('md', { optimizeMemory: true }))
            .pipe($.markdown())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/to-html', ['preprocess/html', 'preprocess/jade', 'preprocess/markdown']);

    ////// TO CSS

    gulp.task('preprocess/css', function () {

        return streams.fromExts(options.src, ['css'])
            .pipe($.cached('css', { optimizeMemory: true }))
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/scss', function () {

        return streams.fromExts(options.src, ['scss'])
            .pipe($.cached('scss', { optimizeMemory: true }))
            .pipe($.sass())
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/less', function () {

        return streams.fromExts(options.src, ['less'])
            .pipe($.cached('less', { optimizeMemory: true }))
            .pipe($.less())
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/stylus', function () {

        return streams.fromExts(options.src, ['styl'])
            .pipe($.cached('styl', { optimizeMemory: true }))
            .pipe($.stylus())
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/to-css', ['preprocess/css', 'preprocess/scss', 'preprocess/less', 'preprocess/stylus']);

    ////// TO JS

    gulp.task('preprocess/js', function () {

        return streams.fromExts(options.src, ['js'])
            .pipe($.cached('js', { optimizeMemory: true }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/typescript', function () {

        return streams.fromExts(options.src, ['ts'])
            .pipe($.cached('ts', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.typescript({ noExternalResolve: true }))
            .js
            .pipe($.sourcemaps.write({ sourceRoot: 'source' }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/coffee', function () {

        return streams.fromExts(options.src, ['coffee'])
            .pipe($.cached('coffee', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.coffee())
            .pipe($.sourcemaps.write({ sourceRoot: 'source' }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/to-js', ['preprocess/js', 'preprocess/typescript', 'preprocess/coffee']);

    ////// DEV

    gulp.task('buid-dev/injects', ['preprocess/to-html', 'preprocess/to-css', 'preprocess/to-js'], function () {

        var cssAndJsToInject = streams.fromDeps(options.preprocess, [options.cssDeps, options.jsDeps]);

        return streams.fromExts(options.preprocess, options.exts.html)
            .pipe($.inject(cssAndJsToInject))
            .pipe($.cached('injects', { optimizeMemory: true }))
            .pipe(gulp.dest(options.dev));
    });

    gulp.task('serve', ['buid-dev/injects'], function () {

        setInterval(function () {

            jf.writeFile('.one-gulp/caches.json', $.cached.caches);

        }, 1000);

        servers.startStatic();
        servers.startBrowserSync();

        watcher.watch(options.src, {

            add: function (path) {

                if (_(path).hasExt(options.exts.toHtml, options.exts.toCss, options.exts.toJs)) {
                    startTask('buid-dev/injects');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            },

            change: function (path) {

                if (_(path).hasExt(options.exts.toHtml)) {
                    startTask('buid-dev/injects');
                }
                else if (_(path).hasExt(options.exts.toCss)) {
                    startTask('preprocess/css');
                }
                else if (_(path).hasExt(options.exts.toJs)) {
                    startTask('preprocess/js');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            },

            unlink: function (path) {

                purge.fromCaches(path, $.cached.caches);

                if (_(path).hasExt(options.exts.toHtml, options.exts.toCss, options.exts.toJs)) {
                    purge.fromFileSystem(path);
                    startTask('buid-dev/injects');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            },

            unlinkDir: function (path) {
                purge.fromFileSystem(path);
            }
        });

        watcher.watch(options.preprocess, {

            add: function (path) {

                if (_(path).hasExt(options.exts.css, options.exts.js)) {
                    servers.reloadBrowserSync(path);
                }
            },

            change: function (path) {

                if (_(path).hasExt(options.exts.css, options.exts.js)) {
                    servers.reloadBrowserSync(path);
                }
            },

            unlink: function (path) {

                purge.fromCaches(path, $.cached.caches);

                if (_(path).hasExt(options.exts.css, options.exts.js)) {
                    servers.reloadBrowserSync(path);
                }
            }
        });

        watcher.watch(options.dev, {

            add: function (path) {

                if (_(path).hasExt(options.exts.html)) {
                    servers.reloadBrowserSync(path);
                }
            },

            change: function (path) {

                if (_(path).hasExt(options.exts.html)) {
                    servers.reloadBrowserSync(path);
                }
            },

            unlink: function (path) {

                purge.fromCaches(path, $.cached.caches);

                if (_(path).hasExt(options.exts.html)) {
                    servers.reloadBrowserSync(path);
                }
            }
        });
    });

    ////// PROD

    gulp.task('build-prod/css', ['preprocess/to-css'], function () {

        return streams.concatAndMinify({
            deps: options.cssDeps,
            concatFn: $.concatCss,
            minifyFn: $.minifyCss
        });
    });

    gulp.task('build-prod/js', ['preprocess/to-js'], function () {

        return streams.concatAndMinify({
            deps: options.jsDeps,
            concatFn: $.concat,
            minifyFn: $.uglify
        });
    });

    gulp.task('build-prod/injects', ['preprocess/to-html', 'build-prod/css', 'build-prod/js'], function () {

        var cssAndJsToInject = streams.fromOutputDeps(options.prod, [options.cssDeps, options.jsDeps]);

        return streams.fromExts(options.preprocess, options.exts.html)
            .pipe($.inject(cssAndJsToInject, { ignorePath: options.prod }))
            .pipe($.htmlmin(htmlminOptions))
            .pipe(gulp.dest(options.prod));
    });

    gulp.task('build-prod/img', function () {

        return streams.fromExts(options.src, options.exts.img)
            .pipe($.imagemin({
                progressive: true,
                interlaced: true
            }))
            .pipe(gulp.dest(options.prod));
    });

    gulp.task('build-prod/others', function () {

        return streams.notFromExts(options.src, [options.exts.toHtml, options.exts.toCss, options.exts.toJs, options.exts.img])
            .pipe(gulp.dest(options.prod));
    });

    gulp.task('build-prod', ['build-prod/injects', 'build-prod/img', 'build-prod/others']);

    gulp.task('default', ['build-prod']);
};
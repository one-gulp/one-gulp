'use strict';

var $ = exports.$ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    jf = require('jsonfile'),
    through2 = require('through2'),
    streamify = require('stream-array');

var Promise = require('es6-promise-polyfill').Promise;

var _ = require('./underscore-mixins.js');

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

exports.init = function (gulp, options) {

    options = exports.options = _(options).defaults({

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

        bowerDir: 'bower_components',

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

    var purge = exports.purge = require('./purge.js')(options),
        servers = exports.servers = require('./servers.js')(options),
        streams = exports.streams = require('./streams.js')(options),
        watcher = exports.watcher = require('./watcher.js');

    var startTask = _.debounce(function (task) {
        gulp.task(task)();
    });

    rimraf.sync(options.dev);
    rimraf.sync(options.preprocess);
    rimraf.sync(options.prod);

    // HTML preprocessing

    function pass2(mainFn) {

        var array = [];

        return function (done) {

            mainFn()
                .on('data', function (a) {
                    array.push(a);
                })
                .on('end', function () {
                    done(null, streamify(array));
                });
        }
    }

    gulp.task('preprocess/foo', pass2(function () {

        return streams.fromExts(options.src, options.exts.html);
    }));

    gulp.task('preprocess/bar', pass2(function () {

        return streams.fromExts(options.src, options.exts.css);
    }));

    function retrieve(gulpFns, resultFn) {
        return function (done) {
            gulpFns(function (errors, results) {
                resultFn(_(results).mergeStreams());
                done();
            });
        }
    }

    gulp.task('preprocess/foobar', retrieve(gulp.parallel('preprocess/foo', 'preprocess/bar'), function (stream) {

        stream
            .on('data', function (a) {
                console.log(a);
            })
            .on('end', function () {
                console.log('end');
            });
    }));

    gulp.task('preprocess/html', pass2(function () {

        return streams.fromExts(options.src, options.exts.html)
            .pipe($.cached('html', { optimizeMemory: true }));
        //.pipe(gulp.dest(options.preprocess)));
    }));

    gulp.task('preprocess/jade', pass2(function () {

        return streams.fromExts(options.src, ['jade'])
            .pipe($.cached('jade', { optimizeMemory: true }))
            .pipe($.plumber())
            .pipe($.jade({ pretty: true }));
        //.pipe(gulp.dest(options.preprocess));
    }));

    gulp.task('preprocess/markdown', pass2(function () {

        return streams.fromExts(options.src, ['md'])
            .pipe($.cached('md', { optimizeMemory: true }))
            .pipe($.markdown());
        //.pipe(gulp.dest(options.preprocess));
    }));

    //gulp.task('preprocess/to-html', gulp.parallel('preprocess/html', 'preprocess/jade', 'preprocess/markdown'));

    gulp.task('preprocess/to-html', retrieve(gulp.parallel('preprocess/html', 'preprocess/jade', 'preprocess/markdown'), function (stream) {

        stream
            .pipe(gulp.dest(options.preprocess));
    }));

    // CSS preprocessing

    gulp.task('preprocess/css', function () {

        return streams.fromExts(options.src, ['css'])
            .pipe($.cached('css', { optimizeMemory: true }))
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/scss', function () {

        return streams.fromExts(options.src, ['scss'])
            .pipe($.cached('scss', { optimizeMemory: true }))
            .pipe($.plumber())
            .pipe($.sass({
                includePaths: [options.src]
            }))
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

    gulp.task('preprocess/to-css', gulp.parallel('preprocess/css', 'preprocess/scss', 'preprocess/less', 'preprocess/stylus'));

    // JS preprocessing

    gulp.task('preprocess/js', function () {

        return streams.fromExts(options.src, ['js'])
            .pipe($.cached('js', { optimizeMemory: true }))
            .pipe($.plumber())
            .pipe($.sourcemaps.init())
            .pipe($['6to5']())
            .pipe($.sourcemaps.write({ sourceRoot: '/src' }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/typescript', function () {

        return streams.fromExts(options.src, ['ts'])
            .pipe($.cached('ts', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.typescript({ noExternalResolve: true }))
            .js
            .pipe($.sourcemaps.write({ sourceRoot: '/src' }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/coffee', function () {

        return streams.fromExts(options.src, ['coffee'])
            .pipe($.cached('coffee', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.coffee())
            .pipe($.sourcemaps.write({ sourceRoot: '/src' }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/to-js', gulp.parallel('preprocess/js', 'preprocess/typescript', 'preprocess/coffee'));

    // ALL preprocessing

    gulp.task('preprocess', gulp.parallel('preprocess/to-html', 'preprocess/to-css', 'preprocess/to-js'));

    //// DEV build

    gulp.task('injects-dev', function () {

        var cssAndJsToInject = streams.fromDeps(options.preprocess, [options.cssDeps, options.jsDeps]);

        return streams.fromExts(options.preprocess, options.exts.html)
            .pipe($.inject(cssAndJsToInject))
            .pipe($.cached('injects', { optimizeMemory: true }))
            .pipe(gulp.dest(options.dev));
    });

    gulp.task('build-dev', gulp.series(
        'preprocess',
        'injects-dev'
    ));

    gulp.task('watch-and-serve', function () {

        //    setInterval(function () {
        //
        //        jf.writeFile('.one-gulp/caches.json', $.cached.caches);
        //
        //    }, 1000);

        servers.startStatic();
        servers.startBrowserSync();

        //    watcher.watch(options.src, {
        //
        //        add: function (path) {
        //
        //            if (_(path).hasExt(options.exts.toHtml, options.exts.toCss, options.exts.toJs)) {
        //                startTask('build-dev/html');
        //            }
        //            else {
        //                servers.reloadBrowserSync(path);
        //            }
        //        },
        //
        //        change: function (path) {
        //
        //            if (_(path).hasExt(options.exts.toHtml)) {
        //                startTask('build-dev/html');
        //            }
        //            else if (_(path).hasExt(options.exts.toCss)) {
        //                startTask('preprocess/to-css');
        //            }
        //            else if (_(path).hasExt(options.exts.toJs)) {
        //                startTask('preprocess/to-js');
        //            }
        //            else {
        //                servers.reloadBrowserSync(path);
        //            }
        //        },
        //
        //        unlink: function (path) {
        //
        //            purge.fromCaches(path, $.cached.caches);
        //
        //            if (_(path).hasExt(options.exts.toHtml, options.exts.toCss, options.exts.toJs)) {
        //                purge.fromFileSystem(path);
        //                startTask('build-dev/html');
        //            }
        //            else {
        //                servers.reloadBrowserSync(path);
        //            }
        //        },
        //
        //        unlinkDir: function (path) {
        //            purge.fromFileSystem(path);
        //        }
        //    });
        //
        //    function reloadIfCssOrJs(path) {
        //
        //        if (_(path).hasExt(options.exts.css, options.exts.js)) {
        //            servers.reloadBrowserSync(path);
        //        }
        //    }
        //
        //    watcher.watch(options.preprocess, {
        //
        //        add: reloadIfCssOrJs,
        //        change: reloadIfCssOrJs,
        //
        //        unlink: function (path) {
        //            purge.fromCaches(path, $.cached.caches);
        //            reloadIfCssOrJs(path);
        //        }
        //    });
        //
        //    function reloadIfHtml(path) {
        //        servers.reloadBrowserSync(path);
        //    }
        //
        //    watcher.watch(options.dev, {
        //
        //        add: reloadIfHtml,
        //        change: reloadIfHtml,
        //
        //        unlink: function (path) {
        //            purge.fromCaches(path, $.cached.caches);
        //            reloadIfHtml(path);
        //        }
        //    });
    });
    //
    //gulp.task('serve', gulp.series(
    //    'build-dev',
    //    'injects-dev'
    //));
    //
    ////// PROD build
    //
    //gulp.task('build-prod/css', gulp.series('preprocess/to-css', function () {
    //
    //    return streams.concatAndMinify({
    //        deps: options.cssDeps,
    //        concatFn: $.concatCss,
    //        minifyFn: $.minifyCss
    //    });
    //}));
    //
    //gulp.task('build-prod/js', gulp.series('preprocess/to-js', function () {
    //
    //    return streams.concatAndMinify({
    //        deps: options.jsDeps,
    //        concatFn: $.concat,
    //        minifyFn: $.uglify
    //    });
    //}));
    //
    //gulp.task('build-prod/injects', ['preprocess/to-html', 'build-prod/css', 'build-prod/js'], function () {
    //
    //    var cssAndJsToInject = streams.fromOutputDeps(options.prod, [options.cssDeps, options.jsDeps]);
    //
    //    return streams.fromExts(options.preprocess, options.exts.html)
    //        .pipe($.inject(cssAndJsToInject, { ignorePath: options.prod }))
    //        .pipe($.htmlmin(htmlminOptions))
    //        .pipe(gulp.dest(options.prod));
    //});
    //
    //gulp.task('build-prod/img', function () {
    //
    //    return streams.fromExts(options.src, options.exts.img)
    //        .pipe($.imagemin({
    //            progressive: true,
    //            interlaced: true
    //        }))
    //        .pipe(gulp.dest(options.prod));
    //});
    //
    //gulp.task('build-prod/others', function () {
    //
    //    return streams.notFromExts(options.src, [options.exts.toHtml, options.exts.toCss, options.exts.toJs, options.exts.img])
    //        .pipe(gulp.dest(options.prod));
    //});
    //
    //gulp.task('build-prod', ['build-prod/injects', 'build-prod/img', 'build-prod/others']);
    //
    //gulp.task('default', ['build-prod']);

};
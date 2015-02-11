'use strict';

var $ = exports.$ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    jf = require('jsonfile'),
    streamify = require('stream-array');

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
    rimraf.sync(options.prod);


    function isStream(stream) {
        return stream != null && typeof stream.on === 'function';
    }

    function cloneStream(stream, done) {

        var array = [];

        stream
            .on('data', function (chunk) {
                array.push(chunk)
            })
            .on('end', function () {
                done(streamify(array));
            });
    }

    function merge(streamsArray) {

        return _(streamsArray).chain()
            .flatten()
            .mergeStreams()
            .value();
    }

    // TODO verif compatibilité avec les autres types d'asynchronisme
    // TODO appliquer meme comportement sur resultFn (async etc...)

    function gulpTask(taskName, taskFn, resultFn) {

        gulp.task(taskName, function (taskIsDone) {

            var returnFromTaskFn = taskFn(function (errors, result) {

                if (resultFn != null) {

                    var returnFromResultFn = resultFn(result);

                    if (isStream(returnFromResultFn)) {

                        cloneStream(returnFromResultFn, function (clonedStream) {
                            taskIsDone(null, clonedStream);
                        });
                    } else {
                        taskIsDone(null, returnFromResultFn);
                    }
                } else {
                    taskIsDone(errors, result);
                }
            });

            if (isStream(returnFromTaskFn)) {

                cloneStream(returnFromTaskFn, function (clonedStream) {
                    taskIsDone(null, clonedStream);
                });
            }
            else {
                return returnFromTaskFn;
            }

        });
    }

    // HTML preprocessing

    gulpTask('preprocess/html', function () {

        return streams.fromExts(options.src, options.exts.html)
            .pipe($.cached('html', { optimizeMemory: true }));
    });

    gulpTask('preprocess/jade', function () {

        return streams.fromExts(options.src, ['jade'])
            .pipe($.cached('jade', { optimizeMemory: true }))
            .pipe($.plumber())
            .pipe($.jade({ pretty: true }));
    });

    gulpTask('preprocess/markdown', function () {

        return streams.fromExts(options.src, ['md'])
            .pipe($.cached('md', { optimizeMemory: true }))
            .pipe($.markdown());
    });

    gulpTask('preprocess/to-html', gulp.parallel('preprocess/html', 'preprocess/jade', 'preprocess/markdown'));

    // CSS preprocessing

    gulpTask('preprocess/css', function () {

        return streams.fromExts(options.src, ['css'])
            .pipe($.cached('css', { optimizeMemory: true }));
    });

    gulpTask('preprocess/scss', function () {

        return streams.fromExts(options.src, ['scss'])
            .pipe($.cached('scss', { optimizeMemory: true }))
            .pipe($.plumber())
            .pipe($.sass({
                includePaths: [options.src]
            }));
    });

    gulpTask('preprocess/less', function () {

        return streams.fromExts(options.src, ['less'])
            .pipe($.cached('less', { optimizeMemory: true }))
            .pipe($.less());
    });

    gulpTask('preprocess/stylus', function () {

        return streams.fromExts(options.src, ['styl'])
            .pipe($.cached('styl', { optimizeMemory: true }))
            .pipe($.stylus());
    });

    gulpTask('preprocess/to-css', gulp.parallel('preprocess/css', 'preprocess/scss', 'preprocess/less', 'preprocess/stylus'), function (streamArr) {

        return merge(streamArr)
            .pipe($.autoprefixer());
    });

    // JS preprocessing

    gulpTask('preprocess/js', function () {

        return streams.fromExts(options.src, ['js'])
            .pipe($.cached('js', { optimizeMemory: true }))
            .pipe($.plumber())
            .pipe($.sourcemaps.init())
            .pipe($['6to5']())
            .pipe($.sourcemaps.write({ sourceRoot: '/src' }));
    });

    gulpTask('preprocess/typescript', function () {

        return streams.fromExts(options.src, ['ts'])
            .pipe($.cached('ts', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.typescript({ noExternalResolve: true }))
            .js
            .pipe($.sourcemaps.write({ sourceRoot: '/src' }));
    });

    gulpTask('preprocess/coffee', function () {

        return streams.fromExts(options.src, ['coffee'])
            .pipe($.cached('coffee', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.coffee())
            .pipe($.sourcemaps.write({ sourceRoot: '/src' }));
    });

    gulpTask('preprocess/to-js', gulp.parallel('preprocess/js', 'preprocess/typescript', 'preprocess/coffee'));

    // ALL preprocessing

    gulpTask('preprocess', gulp.parallel('preprocess/to-html', 'preprocess/to-css', 'preprocess/to-js'), function (streamArr) {

        return merge(streamArr)
            .pipe(gulp.dest(options.dev));
        //.on('data', function (a) {
        //    console.log(a);
        //})
        //.on('end', function () {
        //    console.log('end');
        //});
    });

    //// DEV build

    gulp.task('injects-dev', function () {

        var cssAndJsToInject = streams.fromDeps(options.dev, [options.cssDeps, options.jsDeps]);

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

        watcher.watch(options.src, {

            add: function (path) {

                if (_(path).hasExt(options.exts.toHtml, options.exts.toCss, options.exts.toJs)) {
                    startTask('build-dev/html');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            },

            change: function (path) {

                if (_(path).hasExt(options.exts.toHtml)) {
                    startTask('build-dev/html');
                }
                else if (_(path).hasExt(options.exts.toCss)) {
                    startTask('preprocess/to-css');
                }
                else if (_(path).hasExt(options.exts.toJs)) {
                    startTask('preprocess/to-js');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            },

            unlink: function (path) {

                purge.fromCaches(path, $.cached.caches);

                if (_(path).hasExt(options.exts.toHtml, options.exts.toCss, options.exts.toJs)) {
                    purge.fromFileSystem(path);
                    startTask('build-dev/html');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            },

            unlinkDir: function (path) {
                purge.fromFileSystem(path);
            }
        });

        function reloadIfCssOrJs(path) {

            if (_(path).hasExt(options.exts.css, options.exts.js)) {
                servers.reloadBrowserSync(path);
            }
        }

        watcher.watch(options.preprocess, {

            add: reloadIfCssOrJs,
            change: reloadIfCssOrJs,

            unlink: function (path) {
                purge.fromCaches(path, $.cached.caches);
                reloadIfCssOrJs(path);
            }
        });

        function reloadIfHtml(path) {
            servers.reloadBrowserSync(path);
        }

        watcher.watch(options.dev, {

            add: reloadIfHtml,
            change: reloadIfHtml,

            unlink: function (path) {
                purge.fromCaches(path, $.cached.caches);
                reloadIfHtml(path);
            }
        });
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
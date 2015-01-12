'use strict';

var ppath = require('path');

var $ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    chokidar = require('chokidar'),
    bower = require('main-bower-files');

var toArray = require('stream-to-array'),
    jf = require('jsonfile');

var _ = require('./underscore-mixins.js'),
    loggers = require('./loggers.js'),
    servers = require('./servers.js');

exports.init = function (gulp, options) {

    options = options || {};

    options.src = options.src || 'src';
    options.dev = options.dev || '.one-gulp/dev';
    options.preprocess = options.preprocess || '.one-gulp/preprocess';
    options.prod = options.prod || '.one-gulp/prod';

    options.connectPort = options.connectPort || 3001;
    options.browserSyncPort = options.browserSyncPort || 3000;
    options.bindHost = options.bindHost || 'localhost';

    options.cssDeps = options.cssDeps || [
        {
            bowerInclude: '**/*.css',
            output: 'bower-styles.css'
        },
        {
            srcInclude: ['**/*.css'],
            output: 'all-styles.css'
        }
    ];

    options.jsDeps = options.jsDeps || [
        {
            bowerInclude: '**/*.js',
            output: 'bower-scripts.js'
        },
        {
            srcInclude: ['**/*.js'],
            output: 'all-scripts.js'
        }
    ];

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

    var exts = {
        html: ['html'],
        toHtml: ['jade', 'md'],
        css: ['css'],
        toCss: ['scss', 'less', 'styl'],
        js: ['js'],
        toJs: ['ts', 'coffee'],
        img: ['gif', 'jpg', 'jpeg', 'png', 'svg']
    };

    function prefixAllStars(ext) {
        return '**/*.' + ext;
    }

    function allGlobs(extArrays) {

        return _(arguments).chain()
            .flatten()
            .map(prefixAllStars)
            .value();
    }

    function all(/* extArrays */) {

        return gulp.src(allGlobs(arguments), { cwd: options.src, nodir: true });
    }

    function allP(/* extArrays */) {

        return gulp.src(allGlobs(arguments), { cwd: options.preprocess, nodir: true });
    }

    function allBut(/* extArrays */) {

        return gulp.src('**/*', { cwd: options.src, nodir: true })
            .pipe($.filter(allGlobs(arguments), { base: options.src }));
    }

    function depToStream(dep, read, src) {

        read = read || false;
        src = src || options.src;

        var stream;

        if (dep.bowerInclude) {
            stream = gulp.src(bower({ filter: dep.bowerInclude }), {
                read: read,
                nodir: true,
                cwd: ppath.resolve('.'),
                base: ppath.resolve('bower_components')
            });
        }
        if (dep.srcInclude) {
            stream = gulp.src(dep.srcInclude, {
                read: read,
                nodir: true,
                cwd: ppath.resolve(src),
                base: ppath.resolve(src)
            });
        }

        if (dep.exclude) {
            stream = stream.pipe($.filter(dep.exclude))
        }

        if (dep.sort) {
            stream = stream.pipe($.order(dep.sort))
        }

        return stream;
    }

    function replaceExts(path) {
        return path
            .replace(new RegExp('(' + exts.toHtml.join('|') + ')$'), 'html')
            .replace(new RegExp('(' + exts.toCss.join('|') + ')$'), 'css')
            .replace(new RegExp('(' + exts.toJs.join('|') + ')$'), 'js');
    }

    function srcToPreprocessing(path) {
        return replaceExts(path).replace(options.src, options.preprocess);
    }

    function srcToTmp(path) {
        return replaceExts(path).replace(options.src, options.dev);
    }

    var startTask = _.debounce(function (task) {
        gulp.start(task);
    });

    function watchSrc() {

        loggers.watcher('watching', options.src);

        chokidar.watch(options.src, { persistent: true, ignoreInitial: true })
            .on('add', function (path) {

                loggers.watcher('add', path);

                if (_(path).hasExt(exts.html, exts.toHtml, exts.css, exts.toCss, exts.js, exts.toJs)) {
                    startTask('buid-dev/injects');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('change', function (path) {

                loggers.watcher('update', path);

                if (_(path).hasExt(exts.html, exts.toHtml)) {
                    startTask('buid-dev/injects');
                }
                else if (_(path).hasExt(exts.css, exts.toCss)) {
                    startTask('preprocess/css');
                }
                else if (_(path).hasExt(exts.js, exts.toJs)) {
                    startTask('preprocess/js');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('unlink', function (path) {

                loggers.watcher('delete', path);

                for (var cacheName in $.cached.caches) {
                    delete $.cached.caches[cacheName][ppath.resolve(path)];
                    delete $.cached.caches[cacheName][ppath.resolve(srcToPreprocessing(path))];
                    delete $.cached.caches[cacheName][ppath.resolve(srcToTmp(path))];
                }

                if (_(path).hasExt(exts.html, exts.toHtml, exts.css, exts.toCss, exts.js, exts.toJs)) {
                    rimraf.sync(srcToPreprocessing(path));
                    rimraf.sync(srcToTmp(path));
                    startTask('buid-dev/injects');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('unlinkDir', function (path) {

                loggers.watcher('delete dir', path);
                rimraf.sync(srcToPreprocessing(path));
                rimraf.sync(srcToTmp(path));
            });
    }

    function watchTmp() {

        loggers.watcher('watching', options.dev);

        chokidar.watch(options.dev, { persistent: true, ignoreInitial: true })
            .on('add', function (path) {

                loggers.watcher('add', path);

                if (_(path).hasExt(exts.html, exts.css, exts.js)) {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('change', function (path) {

                loggers.watcher('update', path);

                if (_(path).hasExt(exts.html, exts.css, exts.js)) {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('unlink', function (path) {

                loggers.watcher('delete', path);

                for (var cacheName in $.cached.caches) {
                    delete $.cached.caches[cacheName][ppath.resolve(path)];
                    delete $.cached.caches[cacheName][ppath.resolve(srcToPreprocessing(path))];
                    delete $.cached.caches[cacheName][ppath.resolve(srcToTmp(path))];
                }

                if (_(path).hasExt(exts.html, exts.css, exts.js)) {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('unlinkDir', function (path) {

                loggers.watcher('delete dir', path);
            });
    }

    ///////////////////////////////////////////

    ////// TO HTML

    gulp.task('preprocess/html', function () {

        return all('html')
            .pipe($.cached('html', { optimizeMemory: true }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/jade', function () {

        return all('jade')
            .pipe($.cached('jade', { optimizeMemory: true }))
            .pipe($.jade({ pretty: true }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/markdown', function () {

        return all('md')
            .pipe($.cached('md', { optimizeMemory: true }))
            .pipe($.markdown())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/to-html', ['preprocess/html', 'preprocess/jade', 'preprocess/markdown']);

    ////// TO CSS

    gulp.task('preprocess/css', function () {

        return all('css')
            .pipe($.cached('css', { optimizeMemory: true }))
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/scss', function () {

        return all('scss')
            .pipe($.cached('scss', { optimizeMemory: true }))
            .pipe($.sass())
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/less', function () {

        return all('less')
            .pipe($.cached('less', { optimizeMemory: true }))
            .pipe($.less())
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/stylus', function () {

        return all('styl')
            .pipe($.cached('styl', { optimizeMemory: true }))
            .pipe($.stylus())
            .pipe($.autoprefixer())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/to-css', ['preprocess/css', 'preprocess/scss', 'preprocess/less', 'preprocess/stylus']);

    ////// TO JS

    gulp.task('preprocess/js', function () {

        return all('js')
            .pipe($.cached('js', { optimizeMemory: true }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/typescript', function () {

        return all('ts')
            .pipe($.cached('ts', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.typescript({ noExternalResolve: true }))
            .js
            .pipe($.sourcemaps.write({ sourceRoot: 'source' }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/coffee', function () {

        return all('coffee')
            .pipe($.cached('coffee', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.coffee())
            .pipe($.sourcemaps.write({ sourceRoot: 'source' }))
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/to-js', ['preprocess/js', 'preprocess/typescript', 'preprocess/coffee']);

    ////// DEV

    gulp.task('buid-dev/injects', ['preprocess/to-html', 'preprocess/to-css', 'preprocess/to-js'], function () {

        var allDepsStream = _([options.cssDeps, options.jsDeps]).chain()
            .flatten()
            .map(function (dep) {
                return depToStream(dep, false, options.preprocess);
            })
            .mergeStreams()
            .value();

        return allP(exts.html)
            .pipe($.inject(allDepsStream))
            .pipe($.cached('injects', { optimizeMemory: true }))
            .pipe(gulp.dest(options.dev));
    });

    gulp.task('serve', ['buid-dev/injects'], function () {

        setInterval(function () {

            jf.writeFile('.one-gulp/caches.json', $.cached.caches);

        }, 1000);

        servers.startStatic({
            host: options.bindHost,
            port: options.connectPort,
            mounts: ['bower_components'],
            paths: [options.dev, options.src]
        });

        servers.startBrowserSync({
            proxyPort: options.connectPort,
            host: options.bindHost,
            port: options.browserSyncPort
        });

        watchSrc();
        watchTmp();
    });

    ////// PROD

    gulp.task('build-prod/css', ['preprocess/to-css'], function () {

        return _(options.cssDeps).chain()
            .map(function (dep) {

                var stream = depToStream(dep, true, options.preprocess);

                return {
                    stream: stream,
                    output: dep.output
                };
            })
            .groupBy('output')
            .map(function (objects, output) {

                var sourceStream = _(objects).chain()
                    .pluck('stream')
                    .mergeStreams()
                    .value();

                if (output !== 'undefined') {
                    sourceStream = sourceStream.pipe($.concatCss(output));
                }

                return sourceStream;
            })
            .mergeStreams()
            .value()
            .pipe($.minifyCss())
            .pipe(gulp.dest(options.prod));
    });

    gulp.task('build-prod/js', ['preprocess/to-js'], function () {

        return _(options.jsDeps).chain()
            .map(function (dep) {

                var stream = depToStream(dep, true, options.preprocess);

                return {
                    stream: stream,
                    output: dep.output
                };
            })
            .groupBy('output')
            .map(function (objects, output) {

                var sourceStream = _(objects).chain()
                    .pluck('stream')
                    .mergeStreams()
                    .value();

                if (output !== 'undefined') {
                    sourceStream = sourceStream.pipe($.concat(output));
                }

                return sourceStream;
            })
            .mergeStreams()
            .value()
            .pipe($.uglify())
            .pipe(gulp.dest(options.prod));
    });

    gulp.task('build-prod/injects', ['preprocess/to-html', 'build-prod/css', 'build-prod/js'], function () {

        var allPath = _([options.cssDeps, options.jsDeps]).chain()
            .flatten()
            .pluck('output')
            .value();

        var allDepsStream = gulp.src(allPath, { cwd: options.prod, read: false });

        return allP(exts.html)
            .pipe($.inject(allDepsStream, { ignorePath: options.prod }))
            .pipe($.htmlmin(htmlminOptions))
            .pipe(gulp.dest(options.prod));
    });

    gulp.task('build-prod/img', function () {

        return all(exts.img)
            .pipe($.imagemin({
                progressive: true,
                interlaced: true
            }))
            .pipe(gulp.dest(options.prod));
    });

    gulp.task('build-prod/others', function () {

        return allBut([exts.html, exts.toHtml, exts.css, exts.toCss, exts.js, exts.toJs, exts.img])
            .pipe(gulp.dest(options.prod));
    });

    gulp.task('build-prod', ['build-prod/injects', 'build-prod/img', 'build-prod/others']);

    gulp.task('default', ['build-prod']);
};
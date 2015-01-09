'use strict';

var ppath = require('path');

var $ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    chokidar = require('chokidar'),
    bower = require('main-bower-files');

var toArray = require('stream-to-array');

var _ = require('./underscore-mixins.js'),
    loggers = require('./loggers.js'),
    servers = require('./servers.js');

exports.init = function (gulp, options) {

    options = options || {};
    ''
    options.src = options.src || 'src';
    options.tmp = options.tmp || '.tmp/dev';
    options.preprocess = options.preprocess || '.tmp/preprocess';
    options.dest = options.dest || '.tmp/prod';

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

    rimraf.sync(options.tmp);
    rimraf.sync(options.preprocess);
    rimraf.sync(options.dest);

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
        return replaceExts(path).replace(options.src, options.tmp);
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
                    startTask('preprocess/html');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('change', function (path) {

                loggers.watcher('update', path);

                if (_(path).hasExt(exts.html, exts.toHtml)) {
                    startTask('preprocess/html');
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
                }

                if (_(path).hasExt(exts.html, exts.toHtml, exts.css, exts.toCss, exts.js, exts.toJs)) {
                    rimraf.sync(srcToPreprocessing(path));
                    rimraf.sync(srcToTmp(path));
                    startTask('preprocess/html');
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

        loggers.watcher('watching', options.tmp);

        chokidar.watch(options.tmp, { persistent: true, ignoreInitial: true })
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

    gulp.task('preprocess/scss', function () {

        return all('scss')
            .pipe($.cached('scss', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.sass({
                errLogToConsole: true
            }))
            .pipe($.sourcemaps.write())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/less', function () {

        return all('less')
            .pipe($.cached('css', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.less())
            .pipe($.sourcemaps.write())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/stylus', function () {

        return all('styl')
            .pipe($.cached('styl', { optimizeMemory: true }))
            .pipe($.stylus())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/css', ['preprocess/scss', 'preprocess/less', 'preprocess/stylus'], function () {

        return _([allP('css'), all('css')])
            .mergeStreams()
            .pipe($.cached('css', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.autoprefixer())
            .pipe($.sourcemaps.write())
            .pipe(gulp.dest(options.tmp));
    });

    gulp.task('preprocess/typescript', function () {

        return all('ts')
            .pipe($.cached('ts', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.typescript({ noExternalResolve: true }))
            .js
            .pipe($.sourcemaps.write())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/coffee', function () {

        return all('coffee')
            .pipe($.cached('coffee', { optimizeMemory: true }))
            .pipe($.sourcemaps.init())
            .pipe($.coffee())
            .pipe($.sourcemaps.write())
            .pipe(gulp.dest(options.preprocess));
    });

    gulp.task('preprocess/js', ['preprocess/typescript', 'preprocess/coffee'], function () {

        return _([allP('js'), all('js')])
            .mergeStreams()
            .pipe($.cached('js', { optimizeMemory: true }))
            .pipe(gulp.dest(options.tmp));
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

    gulp.task('preprocess/html', ['preprocess/jade', 'preprocess/markdown', 'preprocess/css', 'preprocess/js'], function () {

        var allDepsStream = _([options.cssDeps, options.jsDeps]).chain()
            .flatten()
            .map(function (dep) {
                return depToStream(dep, false, options.tmp);
            })
            .mergeStreams()
            .value();

        return _([allP(exts.html), all(exts.html)])
            .mergeStreams()
            .pipe($.inject(allDepsStream))
            .pipe($.cached('html', { optimizeMemory: true }))
            .pipe(gulp.dest(options.tmp));
    });

    gulp.task('preprocess/all', ['preprocess/html'], function () {

    });

    gulp.task('build-dev/css', function () {

        return _(options.cssDeps).chain()
            .filter(function (dep) {
                return dep.srcInclude != null;
            })
            .map(function (dep) {
                return depToStream(dep, true);
            })
            .mergeStreams()
            .value()
            .pipe($.sourcemaps.init())
            .pipe($.autoprefixer())
            .pipe($.sourcemaps.write())
            .pipe(gulp.dest(options.tmp));
    });

    gulp.task('build-dev/html', ['build-dev/css', 'build-dev/scss'], function () {

        var allDepsStream = _([options.cssDeps, options.jsDeps]).chain()
            .flatten()
            .map(function (dep) {
                return depToStream(dep, false, options.tmp);
            })
            .mergeStreams()
            .value();

        return all(exts.html)
            .pipe($.inject(allDepsStream))
            .pipe(gulp.dest(options.tmp));
    });

    gulp.task('serve', ['preprocess/all'], function () {

        servers.startStatic({
            host: options.bindHost,
            port: options.connectPort,
            mounts: ['bower_components'],
            paths: [options.tmp, options.src]
        });

        servers.startBrowserSync({
            proxyPort: options.connectPort,
            host: options.bindHost,
            port: options.browserSyncPort
        });

        watchSrc();
        watchTmp();
    });

    gulp.task('build/css', ['build-dev/css'], function () {

        return _(options.cssDeps).chain()
            .map(function (dep) {

                var stream = depToStream(dep, true, options.tmp);

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
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build/js', function () {

        return _(options.jsDeps).chain()
            .map(function (dep) {

                var stream = depToStream(dep, true);

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
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build/html', ['build/css', 'build/js'], function () {

        var allPath = _([options.cssDeps, options.jsDeps]).chain()
            .flatten()
            .pluck('output')
            .value();

        var allDepsStream = gulp.src(allPath, { cwd: options.dest, read: false });

        return all(exts.html)
            .pipe($.inject(allDepsStream, { ignorePath: options.dest }))
            .pipe($.htmlmin(htmlminOptions))
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build/img', function () {

        return all(exts.img)
            .pipe($.imagemin({
                progressive: true,
                interlaced: true
            }))
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build/all', ['build/html', 'build/css', 'build/js', 'build/img'], function () {

        return allBut(exts.html, exts.css, exts.js, exts.img)
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('default', ['build/all']);
};
'use strict';

var $ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    chokidar = require('chokidar'),
    bower = require('main-bower-files');

var _ = require('./underscore-mixins.js'),
    loggers = require('./loggers.js'),
    servers = require('./servers.js');

exports.init = function (gulp, options) {

    options = options || {};

    options.src = options.src || 'src';
    options.tmp = options.tmp || '.dev';
    options.dest = options.dest || '.prod';

    options.connectPort = options.connectPort || 3001;
    options.browserSyncPort = options.browserSyncPort || 3000;
    options.bindHost = options.bindHost || 'localhost';

    options.cssDeps = options.cssDeps || [{
        include: ['**/*.css'],
        exclude: [],
        sort: [],
        output: 'all-styles.css'
    }];

    options.jsDeps = options.jsDeps || [{
        include: ['**/*.js'],
        exclude: [],
        sort: [],
        output: 'all-scripts.js'
    }];

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
        css: ['css'],
        js: ['js'],
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

    function allBut(/* extArrays */) {

        return gulp.src('**/*', { cwd: options.src, nodir: true })
            .pipe($.filter(allGlobs(arguments), { base: options.src }));
    }

    var startTask = _.debounce(function (task) {
        gulp.start(task);
    });

    function watchSrc() {

        loggers.watcher('watching', options.src);

        chokidar.watch(options.src, { persistent: true, ignoreInitial: true })
            .on('add', function (path) {

                loggers.watcher('add', path);

                if (_(path).hasExt(exts.html, exts.css, exts.js)) {
                    startTask('build-dev/html');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('change', function (path) {

                loggers.watcher('update', path);

                if (_(path).hasExt(exts.html)) {
                    startTask('build-dev/html');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('unlink', function (path) {

                loggers.watcher('delete', path);

                if (_(path).hasExt(exts.html)) {
                    var pathToRm = path.replace(options.src, options.tmp);
                    rimraf.sync(pathToRm);
                }
                else if (_(path).hasExt(exts.css, exts.js)) {
                    startTask('build-dev/html');
                }
                else {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('unlinkDir', function (path) {

                loggers.watcher('delete dir', path);

                var pathToRm = path.replace(options.src, options.tmp);
                rimraf.sync(pathToRm);
            });
    }

    function watchTmp() {

        loggers.watcher('watching', options.tmp);

        chokidar.watch(options.tmp, { persistent: true, ignoreInitial: true })
            .on('add', function (path) {

                loggers.watcher('add', path);

                if (_(path).hasExt(exts.html)) {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('change', function (path) {

                loggers.watcher('update', path);

                if (_(path).hasExt(exts.html)) {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('unlink', function (path) {

                loggers.watcher('delete', path);

                if (_(path).hasExt(exts.html)) {
                    servers.reloadBrowserSync(path);
                }
            })
            .on('unlinkDir', function (path) {

                loggers.watcher('delete dir', path);
            });
    }

    ///////////////////////////////////////////

    rimraf.sync(options.tmp);
    rimraf.sync(options.dest);

    gulp.task('serve', ['build-dev/html'], function () {

        servers.startStatic({
            host: options.bindHost,
            port: options.connectPort,
            paths: [options.tmp, 'bower_components', options.src]
        });

        servers.startBrowserSync({
            proxyPort: options.connectPort,
            host: options.bindHost,
            port: options.browserSyncPort
        });

        watchSrc();
        watchTmp();
    });

    gulp.task('build-dev/html', ['build-dev/css'], function () {

        var allDeps = _([options.cssDeps, options.jsDeps]).flatten();

        var allDepsStream = _(allDeps).chain()
            .map(function (dep) {

                return gulp.src(dep.include, { cwd: options.src, read: false })
                    .pipe($.filter(dep.exclude))
                    .pipe($.order(dep.sort, { base: options.src }))
            })
            .mergeStreams()
            .value();

        return all(exts.html)
            .pipe($.inject(allDepsStream, { ignorePath: options.src }))
            .pipe(gulp.dest(options.tmp));
    });

    gulp.task('build-dev/css', function () {

        return _(options.cssDeps).chain()
            .map(function (dep) {

                return gulp.src(dep.include, { cwd: options.src })
                    .pipe($.filter(dep.exclude))
            })
            .mergeStreams()
            .value()
            .pipe($.sourcemaps.init())
            .pipe($.autoprefixer())
            .pipe($.sourcemaps.write('.'))
            .pipe(gulp.dest(options.tmp));
    });

    gulp.task('build/css', function () {

        return _(options.cssDeps).chain()
            .map(function (dep) {

                return gulp.src(dep.include, { cwd: options.src })
                    .pipe($.filter(dep.exclude))
                    .pipe($.order(dep.sort, { base: options.src }))
                    .pipe($.concatCss(dep.output))
            })
            .mergeStreams()
            .value()
            .pipe($.minifyCss())
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build/js', function () {

        return _(options.jsDeps).chain()
            .map(function (dep) {

                return gulp.src(dep.include, { cwd: options.src })
                    .pipe($.filter(dep.exclude))
                    .pipe($.order(dep.sort, { base: options.src }))
                    .pipe($.concat(dep.output))
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

    gulp.task('bower', function () {

        console.log(bower());

        var bowerDepsStream = gulp.src(bower(), { cwd: 'bower_components', read: false });

        return all(exts.html)
            .pipe($.inject(bowerDepsStream, { ignorePath: options.src }))
            .pipe(gulp.dest(options.tmp));
    });

    gulp.task('default', ['build/all']);
};
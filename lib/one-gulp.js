'use strict';

var rimraf = require('rimraf'),
    connect = require('connect'),
    serveStatic = require('serve-static'),
    browserSync = require('browser-sync'),
    $ = require('gulp-load-plugins')(),
    _ = require('underscore'),
    merge = require('merge-stream'),
    chokidar = require('chokidar');

exports.init = function (gulp, options) {

    options = options || {};

    options.src = options.src || 'src';
    options.tmp = options.tmp || '.dev';
    options.dest = options.dest || '.prod';

    options.connectPort = options.connectPort || 3001;
    options.browserSyncPort = options.browserSyncPort || 3000;
    options.bindHost = options.bindHost || 'localhost';

    options.sortDeps = options.sortDeps || {};
    options.sortDeps.css = options.sortDeps.css || [];
    options.sortDeps.js = options.sortDeps.js || [];

    //options.cssDeps = [
    //    { excluded: ['yyy.css'] },
    //    { from: ['zzz.css'], to: 'zzz-styles.css' },
    //    { to: 'all-styles.css', includeAllOthers: true },
    //    { from: ['skin/**/*.css'], to: 'skin-styles.css' }
    //];

    options.cssDeps = [
        { excluded: ['yyy.css'] },
        { from: ['zzz.css'], to: 'all-styles.css', includeAllOthers: true },
        { from: ['skin/**/*.css'], to: 'skin-styles.css' }
    ];

    //options.cssDeps = [
    //    { excluded: ['yyy.css'] },
    //    { from: ['zzz.css'], to: 'all-styles.css', includeAllOthers: true },
    //    { from: ['skin/**/*.css', '!skin/colors.css'], to: 'skin-styles.css' }
    //];

    options.jsDeps = [
        { from: ['**/*.js'], to: ['all-scripts.css'] }
    ];

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

    function getGlobPattern(extArrays) {

        var globPattern = _(extArrays).chain()
            .flatten()
            .map(function (ext) {
                return options.src + '/**/*.' + ext;
            })
            .value();

        return globPattern;
    }

    function all(/* extArrays */) {
        return gulp.src(getGlobPattern(arguments));
    }

    function allPath(/* extArrays */) {
        return gulp.src(getGlobPattern(arguments), { read: false });
    }

    function allBut(/* extArrays */) {

        var globPattern = _(arguments).chain()
            .flatten()
            .map(function (ext) {
                return '!' + options.src + '/**/*.' + ext;
            })
            .value();

        globPattern.push(options.src + '/**/*.*');

        return gulp.src(globPattern);
    }

    function allExcluded(deps) {

        return _(deps).chain()
            .pluck('excluded')
            .flatten()
            .compact()
            //.map(prefixWithSrc)
            //.map(function (pattern) {
            //    return '!' + pattern;
            //})
            .value();
    }

    function getFromAndIncludeAllIfNecessary(ext) {

        return function (dep) {
            if (dep.includeAllOthers) {
                return [dep.from, '**/*.' + ext];
            } else {
                return [dep.from];
            }
        }
    }

    function allIncludesOrdered(deps, ext) {

        return _(deps).chain()
            .map(getFromAndIncludeAllIfNecessary(ext))
            .flatten()
            .compact()
            .value();
    }

    ///////////////////////////////////////////

    rimraf.sync(options.tmp);
    rimraf.sync(options.dest);

    gulp.task('serve', function () {

        // static server
        var app = connect();

        app.use(serveStatic(options.tmp));
        app.use(serveStatic(options.src));

        app.listen(options.connectPort, options.bindHost);

        // static server with live reload and input/click/scroll syncs
        browserSync({
            proxy: 'localhost:' + options.connectPort,
            port: options.browserSyncPort,
            open: false,
            notify: false
        });

        chokidar.watch('src', { persistent: true, ignoreInitial: true })
            .on('add', function (path) {

                if (path.match(/\.(html|css|js)$/)) {
                    gulp.start('build-html:dev', function (err) {
                        browserSync.reload();
                    });
                } else {
                    browserSync.reload(path);
                }
            })
            .on('change', function (path) {

                if (path.match(/\.html$/)) {
                    gulp.start('build-html:dev', function () {
                        browserSync.reload();
                    });
                } else {
                    browserSync.reload(path);
                }
            })
            .on('unlink', function (path) {

                if (path.match(/\.html$/)) {
                    var pathToRm = path.replace(new RegExp('^' + options.src), options.tmp);
                    rimraf.sync(pathToRm);
                    browserSync.reload(path);
                } else if (path.match(/\.(css|js)$/)) {
                    gulp.start('build-html:dev', function () {
                        browserSync.reload();
                    });
                } else {
                    browserSync.reload(path);
                }
            })
            .on('unlinkDir', function (path) {
                //console.log('Directory', path, 'has been removed');
                var pathToRm = path.replace(new RegExp('^' + options.src), options.tmp);
                rimraf.sync(pathToRm);
            })
            .on('error', function (error) {
                console.error('Error happened', error);
            })
            .on('ready', function () {
                console.info('Initial scan complete. Ready for changes.');
                gulp.start('build-html:dev', function (err) {
                    browserSync.reload();
                });
            });
    });

    function prefixWithSrc(pattern) {
        return pattern.replace(/^(!?)(.*)$/, '$1' + options.src + '/' + '$2');
    }

    gulp.task('build-html:dev', function () {

        var allExclIncl = allExcluded(options.cssDeps);
        allExclIncl.push(options.src + '/**/*.css');

        var allCssInOrder = allIncludesOrdered(options.cssDeps, 'css');

        var orderedFiles = gulp.src(allExclIncl)
            .pipe($.order(allCssInOrder));

        return all(exts.html)
            .pipe($.inject(orderedFiles, { relative: true }))
            .pipe(gulp.dest(options.tmp));
    });

    gulp.task('build-html:prod', ['build-css'], function () {

        var ordered = _(options.cssDeps).chain()
            .pluck('to')
            .flatten()
            .compact()
            .value();

        var orderedFiles = gulp.src(['.prod/**/*.css'], { read: false })
            .pipe($.order(ordered));

        return all(exts.html)
            .pipe($.inject(orderedFiles, { ignorePath: options.dest }))
            //.pipe($.htmlmin(htmlminOptions))
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build-css', function () {

        var allExcludes = allExcluded(options.cssDeps);

        var allConcatMinifCSS = _(options.cssDeps).chain()
            .filter(function (dep) {
                return dep.to != null;
            })
            .map(function (dep, i, allDeps) {

                //console.log(dep);

                var src = getFromAndIncludeAllIfNecessary('css')(dep);
                src = _(src).chain()
                    .flatten()
                    .compact()
                    .map(prefixWithSrc)
                    .value();

                //// inverser from negatif
                var stepExcludes = _(allDeps).chain()
                    .without(dep)
                    .pluck('from')
                    .flatten()
                    .compact()
                    //.map(prefixWithSrc)
                    //    .map(function (pattern) {
                    //        if (pattern[0] === '!') {
                    //            return pattern.slice(1);
                    //        } else {
                    //            return '!' + pattern;
                    //        }
                    //    })
                    .value();

                var excludes = allExcludes.concat(stepExcludes);

                var order = _(dep.from || []).reject(function (pattern) {
                    return pattern.match(/^!/);
                });

                return {
                    src: src,
                    order: order,
                    excludes: excludes,
                    to: dep.to
                };
            })
            .map(function (target) {

                console.log(target);

                return gulp.src(target.src)
                    .pipe($.filter(target.excludes))
                    .pipe($.order(target.order))
                    .pipe($.concat(target.to))
            })
            .value();

        var merged = merge.apply(null, allConcatMinifCSS);

        return merged
            //.pipe($.minifyCss())
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build-js', function () {

        return all(exts.js)
            .pipe($.order(options.sortDeps.js))
            .pipe($.concat('all-scripts.js'))
            .pipe($.uglify())
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build-img', function () {

        return all(exts.img)
            .pipe($.imagemin({
                progressive: true,
                interlaced: true
            }))
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('build:prod', ['build-html:prod', 'build-css', 'build-js', 'build-img'], function () {

        return allBut(exts.html, exts.css, exts.js, exts.img)
            .pipe(gulp.dest(options.dest));
    });

    gulp.task('default', ['build:prod']);
};
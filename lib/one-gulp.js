'use strict';

var $ = exports.$ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    jf = require('jsonfile');

var _ = require('./underscore-mixins.js'),
    dag = require('./dag.js');

exports.init = function (gulp, options) {

    var one = exports;

    one.options = _(options).defaults({

        exts: {
            html: ['html'],
            preprocessHtml: ['html', 'jade', 'md'],
            css: ['css'],
            preprocessCss: ['css', 'scss', 'less', 'styl'],
            js: ['js'],
            preprocessJs: ['js', 'ts', 'coffee'],
            img: ['gif', 'jpg', 'jpeg', 'png', 'svg']
        },

        src: 'src',
        dev: '.one-gulp/dev',
        prod: '.one-gulp/prod',

        bowerDir: 'bower_components',

        connectPort: 3001,
        browserSyncPort: 3000,
        browserSyncUiPort: 3002,
        weinrePort: 3003,
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

    var purge = one.purge = require('./purge.js')(one.options),
        servers = one.servers = require('./servers.js')(one.options),
        src = one.src = require('./src.js')(one.options),
        watcher = one.watcher = require('./watcher.js');

    rimraf.sync(one.options.dev);
    rimraf.sync(one.options.prod);

    _.extend(one, dag);

    one.sources = {

        html: function () {
            return src.fromExts(one.options.src, 'html');
        },

        jade: function () {
            return gulp.src('**/*.jade', { cwd: one.options.src, nodir: true });
        },

        md: function () {
            return gulp.src('**/*.md', { cwd: one.options.src, nodir: true });
        },

        css: function () {
            return src.fromExts(one.options.src, 'css');
        },

        scss: function () {
            return gulp.src('**/*.scss', { cwd: one.options.src, nodir: true })
            //.pipe($.cached('cache', { optimizeMemory: false }));
        },

        less: function () {
            return gulp.src('**/*.less', { cwd: one.options.src, nodir: true });
        },

        styl: function () {
            return gulp.src('**/*.styl', { cwd: one.options.src, nodir: true });
        },

        bowerCss: function () {
        },

        js: function () {
            return src.fromExts(one.options.src, 'js');
        },

        ts: function () {
            return gulp.src('**/*.ts', { cwd: one.options.src, nodir: true });
        },

        coffee: function () {
            return gulp.src('**/*.coffee', { cwd: one.options.src, nodir: true });
        },

        bowerJs: function () {
        },

        images: function () {
            return src.fromExts(one.options.src, ['gif', 'jpg', 'jpeg', 'png', 'svg']);
        },

        other: function () {
            return src.notFromExts(one.options.src, ['html', 'css', 'js', 'gif', 'jpg', 'jpeg', 'png', 'svg']);
        }
    };
    one.load(one.sources);

    one.transforms = {

        jade: function (jade) {

            return jade
                //.pipe($.plumber())
                .pipe($.jade({ pretty: true }));
        },

        markdown: function (md) {
            return md.pipe($.markdown());
        },

        sass: function (scss) {
            return scss
                .pipe($.sass({
                    includePaths: [options.src]
                }))
            //.pipe($.cached('cache', { optimizeMemory: false }));
        },

        less: function (less) {
            return less.pipe($.less());
        },

        stylus: function (styl) {
            return styl.pipe($.stylus());
        },

        sixToFive: function (js) {

            return js
                .pipe($.sourcemaps.init())
                .pipe($['6to5']())
                .pipe($.sourcemaps.write({ sourceRoot: '/src' }));
        },

        typescript: function (ts) {

            return ts
                .pipe($.sourcemaps.init())
                .pipe($.typescript({ noExternalResolve: true }))
                .js
                .pipe($.sourcemaps.write({ sourceRoot: '/src' }));
        },

        coffeeScript: function (coffee) {

            return coffee
                .pipe($.sourcemaps.init())
                .pipe($.coffee())
                .pipe($.sourcemaps.write({ sourceRoot: '/src' }));
        },

        autoprefix: function (css) {
            return css.pipe($.autoprefixer());
        },

        minifyHtml: function (html) {

            return html.pipe($.htmlmin({
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
            }));
        },

        minifyCss: function (css) {
            return css.pipe($.minifyCss());
        },

        minifyJs: function (js) {
            return js.pipe($.uglify());
        },

        injectDev: function (html, files) {
            return html.pipe($.inject(files));
        },

        injectProd: function (html, files) {
            return html.pipe($.inject(files));
        },

        imagemin: function (images) {

            return images.pipe($.imagemin({
                progressive: true,
                interlaced: true
            }));
        }
    };
    one.load(one.transforms);

    one.outputs = {

        writeToDev: function (stream) {
            return stream.pipe(gulp.dest(one.options.dev));
        },

        browserSync: function (stream) {
            stream.on('data', function (data) {
                servers.reloadBrowserSync(data.path);
            });
        },

        writeToProd: function (stream) {
            return stream.pipe(gulp.dest(one.options.prod));
        }
    };
    one.load(one.outputs);

    // COMMON GRAPH LINKS

    //one.link(one.sources.jade).to(one.transforms.jade);
    //one.link(one.sources.md).to(one.transforms.markdown);

    //one.link(one.sources.scss).to(one.transforms.sass);
    //one.link(one.sources.less).to(one.transforms.less);
    //one.link(one.sources.styl).to(one.transforms.stylus);

    //one.link(one.sources.ts).to(one.transforms.typescript);
    //one.link(one.sources.coffee).to(one.transforms.coffeeScript);

    //one.link(one.sources.css).to(one.transforms.autoprefix);
    //one.link(one.transforms.sass).to(one.transforms.autoprefix);
    //one.link(one.transforms.less).to(one.transforms.autoprefix);
    //one.link(one.transforms.stylus).to(one.transforms.autoprefix);

    // DEV GRAPH LINKS

    //one.link(one.transforms.autoprefix).to(one.transforms.injectDev, true);

    //one.link(one.sources.html).to(one.transforms.injectDev);
    //one.link(one.transforms.jade).to(one.transforms.injectDev);
    //one.link(one.transforms.markdown).to(one.transforms.injectDev);
    //
    //one.link(one.sources.bowerCss).to(one.transforms.injectDev, true);
    //one.link(one.sources.js).to(one.transforms.injectDev, true);
    //one.link(one.transforms.typescript).to(one.transforms.injectDev, true);
    //one.link(one.transforms.coffeeScript).to(one.transforms.injectDev, true);
    //one.link(one.sources.bowerJs).to(one.transforms.injectDev, true);
    //
    //one.link(one.transforms.injectDev).to(one.outputs.writeToDev);
    //one.link(one.transforms.autoprefix).to(one.outputs.writeToDev);
    //one.link(one.transforms.typescript).to(one.outputs.writeToDev);
    //one.link(one.transforms.coffeeScript).to(one.outputs.writeToDev);

    // BROWSER SYNC LINKS

    //one.link(one.sources.js).to(one.outputs.browserSync);
    //one.link(one.sources.images).to(one.outputs.browserSync);
    //one.link(one.outputs.writeToDev).to(one.outputs.browserSync);

    // PROD GRAPH LINKS

    //one.link(one.sources.html).to(one.transforms.injectProd);
    //one.link(one.transforms.jade).to(one.transforms.injectProd);
    //one.link(one.transforms.markdown).to(one.transforms.injectProd);

    //one.link(one.transforms.autoprefix).to(one.transforms.minifyCss);
    //one.link(one.sources.bowerCss).to(one.transforms.minifyCss);

    //one.link(one.sources.js).to(one.transforms.minifyJs);
    //one.link(one.transforms.typescript).to(one.transforms.minifyJs);
    //one.link(one.transforms.coffeeScript).to(one.transforms.minifyJs);
    //one.link(one.sources.bowerJs).to(one.transforms.minifyJs);

    //one.link(one.transforms.minifyCss).to(one.transforms.injectProd, true);
    //one.link(one.transforms.minifyJs).to(one.transforms.injectProd, true);

    //one.link(one.transforms.injectProd).to(one.transforms.minifyHtml);

    //one.link(one.transforms.minifyHtml).to(one.outputs.writeToProd);
    //one.link(one.transforms.minifyCss).to(one.outputs.writeToProd);
    //one.link(one.transforms.minifyJs).to(one.outputs.writeToProd);

    //one.link(one.sources.images).to(one.transforms.imagemin);
    //one.link(one.transforms.imagemin).to(one.outputs.writeToProd);

    //one.link(one.sources.other).to(one.outputs.writeToProd);

    // TASKS

    gulp.task('browserSync', function () {
        return one.run(one.outputs.browserSync);
    });

    gulp.task('serve', ['browserSync'], function () {
        servers.startStatic();
        servers.startBrowserSync();
    });

    gulp.task('watch', function () {

        watcher.watch(options.src, {
            add: function (path) {
                one.run(one.outputs.browserSync);
            },
            change: function (path) {
                one.run(one.outputs.browserSync);
            },
            unlink: function (path) {
                one.run(one.outputs.browserSync);
            },
            unlinkDir: function (path) {
                console.log('unlinkDir', path);
            }
        });

        //watcher.watch(options.src, {
        //
        //    add: function (path) {
        //
        //        if (_(path).hasExt(options.exts.toHtml, options.exts.toCss, options.exts.toJs)) {
        //            startTask('build-dev/html');
        //        }
        //        else {
        //            servers.reloadBrowserSync(path);
        //        }
        //    },
        //
        //    change: function (path) {
        //
        //        if (_(path).hasExt(options.exts.toHtml)) {
        //            startTask('build-dev/html');
        //        }
        //        else if (_(path).hasExt(options.exts.toCss)) {
        //            startTask('preprocess/to-css');
        //        }
        //        else if (_(path).hasExt(options.exts.toJs)) {
        //            startTask('preprocess/to-js');
        //        }
        //        else {
        //            servers.reloadBrowserSync(path);
        //        }
        //    },
        //
        //    unlink: function (path) {
        //
        ////        purge.fromCaches(path, $.cached.caches);
        //
        //        if (_(path).hasExt(options.exts.toHtml, options.exts.toCss, options.exts.toJs)) {
        //            purge.fromFileSystem(path);
        //            startTask('build-dev/html');
        //        }
        //        else {
        //            servers.reloadBrowserSync(path);
        //        }
        //    },
        //
        //    unlinkDir: function (path) {
        //        purge.fromFileSystem(path);
        //    }
        //});
        //
        //function reloadIfCssOrJs(path) {
        //
        //    if (_(path).hasExt(options.exts.css, options.exts.js)) {
        //        servers.reloadBrowserSync(path);
        //    }
        //}
        //
        //watcher.watch(options.preprocess, {
        //
        //    add: reloadIfCssOrJs,
        //    change: reloadIfCssOrJs,
        //
        //    unlink: function (path) {
        ////        purge.fromCaches(path, $.cached.caches);
        //        reloadIfCssOrJs(path);
        //    }
        //});
        //
        //function reloadIfHtml(path) {
        //    servers.reloadBrowserSync(path);
        //}
        //
        //watcher.watch(options.dev, {
        //
        //    add: reloadIfHtml,
        //    change: reloadIfHtml,
        //
        //    unlink: function (path) {
        ////        purge.fromCaches(path, $.cached.caches);
        //        reloadIfHtml(path);
        //    }
        //});
    });

    gulp.task('writeToDev', function () {
        return one.run(one.outputs.writeToDev);
    });

    gulp.task('writeToProd', function () {
        return one.run(one.outputs.writeToProd);
    });

    gulp.task('graph', function (done) {
        one.renderGraph('dot', './one-gulp-streams-graph.svg', done);
    });
};
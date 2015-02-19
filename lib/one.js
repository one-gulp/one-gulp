'use strict';

var path = require('path');

var $ = exports.$ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    bower = require('main-bower-files');

var _ = require('./underscore-mixins.js'),
    dag = require('./dag.js'),
    filterAndSort = require('./filterAndSort.js');

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
                include: ['bower_components/**/*.css'],
                output: 'bower-styles.css'
            },
            {
                include: ['**/*.css'],
                exclude: ['bower_components/**/*.css'],
                output: 'all-styles.css'
            }
        ],

        jsDeps: [
            {
                include: ['bower_components/**/*.js'],
                output: 'bower-scripts.js'
            },
            {
                include: ['**/*.js'],
                exclude: ['bower_components/**/*.js'],
                output: 'all-scripts.js'
            }
        ]
    });

    var servers = one.servers = require('./servers.js'),
        src = one.src = require('./src.js'),
        watcher = one.watcher = require('./watcher.js');

    _.extend(one, dag);

    one.sources = {

        html: () => src.fromExts(one.options.src, 'html'),

        css: () => src.fromExts(one.options.src, 'css'),

        js: () => src.fromExts(one.options.src, 'js'),

        images: () => src.fromExts(one.options.src, ['gif', 'jpg', 'jpeg', 'png', 'svg']),

        jade: () => src.fromExts(one.options.src, 'jade'),

        md: () => src.fromExts(one.options.src, 'md'),

        scss: () => src.fromExts(one.options.src, 'scss'),

        less: () => src.fromExts(one.options.src, 'less'),

        styl: () => src.fromExts(one.options.src, 'styl'),

        ts: () => src.fromExts(one.options.src, 'ts'),

        coffee: () => src.fromExts(one.options.src, 'coffee'),

        bowerCss: () => {

            return gulp.src(bower({ filter: '**/*.css' }), {
                nodir: true,
                cwd: path.resolve('.'),
                base: path.resolve('bower_components')
            });
        },

        bowerJs: () => {

            return gulp.src(bower({ filter: '**/*.js' }), {
                nodir: true,
                cwd: path.resolve('.'),
                base: path.resolve('bower_components')
            });
        },

        other: () => src.notFromExts(one.options.src, ['html', 'css', 'js', 'gif', 'jpg', 'jpeg', 'png', 'svg'])
    };
    one.load(one.sources);

    one.transforms = {

        jade: jade => jade
            .pipe($.jade({ pretty: true })),

        markdown: md => md
            .pipe($.markdown()),

        sass: scss => scss
            .pipe($.sass({
                includePaths: [options.src]
            })),

        less: less => less
            .pipe($.less()),

        stylus: styl => styl
            .pipe($.stylus()),

        babel: js => js
            .pipe($.sourcemaps.init())
            .pipe($.babel())
            .pipe($.sourcemaps.write({ sourceRoot: '/src' })),

        typescript: ts => ts
            .pipe($.sourcemaps.init())
            .pipe($.typescript({ noExternalResolve: true }))
            .js
            .pipe($.sourcemaps.write({ sourceRoot: '/src' })),

        coffeeScript: coffee => coffee
            .pipe($.sourcemaps.init())
            .pipe($.coffee())
            .pipe($.sourcemaps.write({ sourceRoot: '/src' })),

        autoprefix: css => css
            .pipe($.autoprefixer()),

        minifyHtml: html => html
            .pipe($.htmlmin({
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
            })),

        minifyCss: css => css
            .pipe($.minifyCss()),

        concatCss: css => {

            //return css;

            //var final = _(one.options.cssDeps).chain()
            //    .groupBy('output')
            //    .map((groupedDeps, output) => {
            //
            //        var foo = _(groupedDeps).chain()
            //            .map(dep => css
            //                .pipe(filterAndSort(dep)))
            //            .mergeStreams()
            //            .value()
            //            .pipe($.concatCss(output));
            //
            //        return foo;
            //    })
            //    .mergeStreams()
            //    .value();

            //var final = _(one.options.cssDeps).chain()
            //    .map(dep => {
            //
            //        var foo = css
            //            .pipe(filterAndSort(dep))
            //            .pipe($.concatCss(dep.output));
            //
            //        return foo;
            //    })
            //    .mergeStreams()
            //    .value();
            //
            //return final;

            return css
                .pipe($.concatCss('all.css'));
        },

        minifyJs: js => js
            .pipe($.uglify()),

        concatJs: js => js
            .pipe($.concat('all.js')),

        sortCssByDepth: files => files
            .pipe($.sort((fileA, fileB) => {

                var depthA = fileA.path.split(path.sep).length,
                    depthB = fileB.path.split(path.sep).length;

                if (depthA > depthB) {
                    return 1;
                }
                if (depthA < depthB) {
                    return -1;
                }

                if (fileA.path > fileB.path) {
                    return 1;
                }
                if (fileA.path < fileB.path) {
                    return -1;
                }

                return 0;
            })),

        sortJsByDepth: files => files
            .pipe($.sort((fileA, fileB) => {

                var depthA = fileA.path.split(path.sep).length,
                    depthB = fileB.path.split(path.sep).length;

                if (depthA > depthB) {
                    return 1;
                }
                if (depthA < depthB) {
                    return -1;
                }

                if (fileA.path > fileB.path) {
                    return 1;
                }
                if (fileA.path < fileB.path) {
                    return -1;
                }

                return 0;
            })),

        injectDev: (html, allFiles) => {

            function injectDepsToStream(deps) {

                _(deps).chain()
                    .groupBy(dep => dep.name || 'inject')
                    .forEach((groupedDeps, name) => {

                        var groupedStream = _(groupedDeps).chain()
                            .map(dep => allFiles.pipe(filterAndSort(dep)))
                            .mergeStreams()
                            .value();

                        html = html.pipe($.inject(
                            groupedStream,
                            { name: name, ignorePath: one.options.dev }
                        ));
                    });
            }

            injectDepsToStream(one.options.cssDeps);
            injectDepsToStream(one.options.jsDeps);

            return html;
        },

        injectProd: (html, files) => html
            .pipe($.inject(
                files,
                { name: 'inject', ignorePath: 'bower_components' }
            )),

        imagemin: images => images.pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
    };
    one.load(one.transforms);

    var srcToDevMapping = {};

    one.outputs = {

        writeToDev: stream => stream
            .pipe(gulp.dest(one.options.dev)),

        browserSync: stream => {
            stream
                .pipe($.cached('sync'))
                .on('data', data => {

                    if (_(data.history).size() > 1 && _(data.history).last().includes(path.resolve(one.options.dev))) {
                        srcToDevMapping[_(data.history).first()] = _(data.history).last();
                    }

                    servers.reloadBrowserSync(data.path);
                });
        },

        writeToProd: stream => stream
            .pipe(gulp.dest(one.options.prod))

    };
    one.load(one.outputs);

    // COMMON LINKS

    //one.link(one.sources.jade).to(one.transforms.jade);
    //one.link(one.sources.md).to(one.transforms.markdown);

    one.link(one.sources.css).to(one.transforms.autoprefix);
    //one.link(one.sources.scss).to(one.transforms.sass);
    //one.link(one.transforms.sass).to(one.transforms.autoprefix);
    //one.link(one.sources.less).to(one.transforms.less);
    //one.link(one.transforms.less).to(one.transforms.autoprefix);
    //one.link(one.sources.styl).to(one.transforms.stylus);
    //one.link(one.transforms.stylus).to(one.transforms.autoprefix);
    one.link(one.transforms.autoprefix).to(one.transforms.sortCssByDepth);

    one.link(one.sources.js).to(one.transforms.sortJsByDepth);
    //one.link(one.sources.ts).to(one.transforms.typescript);
    //one.link(one.transforms.typescript).to(one.transforms.sortJsByDepth);
    //one.link(one.sources.coffee).to(one.transforms.coffeeScript);
    //one.link(one.transforms.coffeeScript).to(one.transforms.sortJsByDepth);

    // DEV LINKS

    one.link(one.sources.html).to(one.transforms.injectDev);
    //one.link(one.transforms.jade).to(one.transforms.injectDev);
    //one.link(one.transforms.markdown).to(one.transforms.injectDev);

    //one.link(one.sources.bowerCss).to(one.transforms.injectDev, { primary: false });
    //one.link(one.sources.bowerJs).to(one.transforms.injectDev, { primary: false });
    one.link(one.transforms.sortCssByDepth).to(one.transforms.injectDev, { primary: false });
    one.link(one.transforms.sortJsByDepth).to(one.transforms.injectDev, { primary: false });

    one.link(one.transforms.injectDev).to(one.outputs.writeToDev);
    one.link(one.transforms.autoprefix).to(one.outputs.writeToDev);
    //one.link(one.transforms.coffeeScript).to(one.outputs.writeToDev);
    //one.link(one.transforms.typescript).to(one.outputs.writeToDev);

    one.link(one.outputs.writeToDev).to(one.outputs.browserSync);
    one.link(one.sources.js).to(one.outputs.browserSync);
    one.link(one.sources.images).to(one.outputs.browserSync);

    // PROD LINKS

    one.link(one.sources.html).to(one.transforms.injectProd);
    //one.link(one.transforms.jade).to(one.transforms.injectProd);
    //one.link(one.transforms.markdown).to(one.transforms.injectProd);
    one.link(one.transforms.injectProd).to(one.transforms.minifyHtml);
    one.link(one.transforms.minifyHtml).to(one.outputs.writeToProd);

    //one.link(one.sources.bowerCss).to(one.transforms.concatCss);
    one.link(one.transforms.sortCssByDepth).to(one.transforms.concatCss);
    one.link(one.transforms.concatCss).to(one.transforms.minifyCss);
    one.link(one.transforms.concatCss).to(one.transforms.injectProd, { primary: false });
    one.link(one.transforms.minifyCss).to(one.outputs.writeToProd);

    //one.link(one.sources.bowerJs).to(one.transforms.concatJs);
    one.link(one.transforms.sortJsByDepth).to(one.transforms.concatJs);
    one.link(one.transforms.concatJs).to(one.transforms.minifyJs);
    one.link(one.transforms.concatJs).to(one.transforms.injectProd, { primary: false });
    one.link(one.transforms.minifyJs).to(one.outputs.writeToProd);

    one.link(one.sources.images).to(one.transforms.imagemin);
    one.link(one.transforms.imagemin).to(one.outputs.writeToProd);

    // TASKS

    gulp.task('browserSync', function () {
        return one.run(one.outputs.browserSync);
    });

    gulp.task('serve', ['browserSync'], function () {
        servers.startStatic(one.options);
        servers.startBrowserSync(one.options);
    });

    gulp.task('watch', function () {

        watcher.watch(one.options.src, {
            add() {
                one.run(one.outputs.browserSync);
            },
            change() {
                one.run(one.outputs.browserSync);
            },
            unlink(filePath) {

                filePath = path.resolve(filePath);

                rimraf.sync(srcToDevMapping[filePath]);

                one.run(one.outputs.browserSync);
            },
            unlinkDir(filePath) {
                console.log('unlinkDir', filePath);
            }
        });
    });

    gulp.task('writeToDev', function () {
        rimraf.sync(one.options.dev);
        return one.run(one.outputs.writeToDev);
    });

    gulp.task('writeToProd', function () {
        rimraf.sync(one.options.prod);
        return one.run(one.outputs.writeToProd);
    });

    gulp.task('graph', function (done) {
        one.renderGraph('dot', './one-gulp-streams-graph.svg', done);
    });
};
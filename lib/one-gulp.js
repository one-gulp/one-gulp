'use strict';

var $ = exports.$ = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    jf = require('jsonfile'),
    streamify = require('stream-array');

var _ = require('./underscore-mixins.js');

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
        streams = one.streams = require('./streams.js')(one.options),
        watcher = one.watcher = require('./watcher.js');

    rimraf.sync(one.options.dev);
    rimraf.sync(one.options.prod);

    // souces

    function html() {
        return gulp.src('**/*.html', { cwd: one.options.dev, nodir: true });
    }

    function css() {
        return gulp.src('**/*.css', { cwd: one.options.dev, nodir: true });
    }

    function scss() {
        return gulp.src('**/*.scss', { cwd: one.options.dev, nodir: true });
    }

    function js() {
        return gulp.src('**/*.js', { cwd: one.options.dev, nodir: true });
    }

    function bowerCss() {
        // everything but html, scss, css, js
    }

    function bowerJs() {
        // everything but html, scss, css, js
    }

    function other() {
        // everything but html, scss, css, js
    }

    // transforms

    function tfSass(scss) {

        return scss.pipe($.sass({
            includePaths: [options.src]
        }));
    }

    function tfAutoprefix(css) {

        return css.pipe($.autoprefixer());
    }

    function tfMinifyHtml(html) {

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
    }

    function tfMinifyCss(css) {

        return css.pipe($.minifyCss());
    }

    function tfMinifyJs(js) {

        return js.pipe($.uglify());
    }

    function tfInjectsDev(html, cssAndJsFiles) {

        return html.pipe($.inject(cssAndJsFiles));
    }

    function tfInjectsProd(html, cssAndJsFiles) {

        return html.pipe($.inject(cssAndJsFiles));
    }

    // output

    function writeToDev(htmlCssAndJsfiles) {

        htmlCssAndJsfiles
            .pipe(gulp.dest(one.options.dev));
    }

    function writeToProd(htmlCssJsAndOtherFiles) {

        htmlCssJsAndOtherFiles
            .pipe(gulp.dest(one.options.prod));
    }

    function link() {
        return {
            to: function () {

            }
        }
    }

    // COMMON
    // *.scss          -> tfSass
    // (*.css, tfSass) -> tfAutoprefix

    link(scss)
        .to(tfSass);
    link(css, tfSass)
        .to(tfAutoprefix);

    // BUILD DEV
    // *.html, (tfAutoprefix, *.js)       -> injectedHtml
    // (injectedHtml, tfAutoprefix) -> writeToDev

    link({ html: html, files: [tfAutoprefix, bowerCss, js, bowerJs] })
        .to(tfInjectsDev);
    link(tfInjectsDev, tfAutoprefix)
        .to(writeToDev);

    // BUILD PROD
    // tfAutoprefix                                     -> tfMinifyCss
    // *.js                                             -> tfMinifyJs
    // *.html, (tfMinifyCss, tfMinifyJs)                -> injectedHtml
    // injectedHtml                                     -> tfMinifyHtml
    // (tfMinifyHtml, tfMinifyCss, tfMinifyJs, *.other) -> writeToProd

    link(tfAutoprefix, bowerCss)
        .to(tfMinifyCss);
    link(js)
        .to(tfMinifyJs, bowerJs);
    link({ html: html, files: [tfMinifyCss, tfMinifyJs] })
        .to(tfInjectsProd);
    link(tfInjectsProd)
        .to(tfMinifyHtml);
    link(tfMinifyHtml, tfMinifyCss, tfMinifyJs, other)
        .to(writeToProd);

};
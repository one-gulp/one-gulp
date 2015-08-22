'use strict';

let _ = require('./underscore-mixins.js'),
    dag = require('./dag.js');


function pathToPort(path, minPort, maxPort) {

    let sha1 = require('sha1');

    let portSpread = Math.floor((maxPort - minPort) / 4);

    let sha1Path = sha1(path),
        bigNumber = parseInt(sha1Path, 16);

    let integer = bigNumber % portSpread;

    return minPort + integer;
}

function getPort(add) {
    return pathToPort(process.cwd(), 10000, 19999) + add;
}

exports.init = function (gulp, options) {

    let one = exports;

    one.gulp = gulp;

    one.defaultOptions = {

        src: 'src',
        dev: '.one-gulp/dev',
        prod: '.one-gulp/prod',

        connectPort: getPort(0),
        browserSyncPort: getPort(1),
        browserSyncUiPort: getPort(2),
        weinrePort: getPort(3),
        injectWeinreSnippet: false,
        bindHost: 'localhost'
    };

    one.options = options;
    _(one.options).deepExtend(one.defaultOptions);

    let servers = one.servers = require('./servers.js'),
        src = one.src = require('./src.js'),
        watcher = one.watcher = require('./watcher.js');

    one.cache = require('./cache.js');

    _.extend(one, dag);

    one.sources = {};

    one.transforms = {

        injectDev: (html, allFiles) => {

            let filterAndSort = require('./filter-and-sort.js'),
                inject = require('gulp-inject');

            function injectDepsToStream(deps) {

                _(deps).chain()
                    .groupBy(dep => dep.name || 'inject')
                    .forEach((groupedDeps, name) => {

                        var groupedStream = _(groupedDeps).chain()
                            .map(dep => allFiles.pipe(filterAndSort(dep)))
                            .concatVinylStreams()
                            .value();

                        html = html.pipe(inject(
                            groupedStream,
                            { name: name, ignorePath: one.options.dev }
                        ));
                    });
            }

            injectDepsToStream(one.options.css.deps);
            injectDepsToStream(one.options.javascript.deps);

            return html;
        },

        injectProd: (html, files) => {
            let inject = require('gulp-inject');

            return html
                .pipe(inject(
                    files,
                    { name: 'inject', ignorePath: one.options.bower.dir }
                ));
        }
    };



    // WIP - temp load modules
    let fs = require('fs');
    let modulesDir = __dirname + '/modules/';

    fs.readdirSync(modulesDir).forEach(function (moduleFileName) {
        require(modulesDir + moduleFileName)(one, _);
    });

    _(one.options).deepExtend(one.defaultOptions);

    one.load(one.sources);
    one.load(one.transforms);



    one.outputs = {

        writeToDev: stream => {
            return stream
                .pipe(one.cache.cached('writeToDev'))
                .pipe(gulp.dest(one.options.dev))
                .pipe(one.cache.remember('writeToDev'));
        },

        browserSync: stream => {
            return stream
                .pipe(one.cache.cached('browserSync'))
                .pipe(servers.reloadBrowserSync());
        },

        writeToProd: stream => stream
            .pipe(gulp.dest(one.options.prod))

    };
    one.load(one.outputs);

    // CLONE NODE IF NEEDED

    one.clonedTransforms = {
        svg: {
            inject: {
                dev: one.clone(one.transforms.svg.inject, 'svg:inject:dev'),
                prod: one.clone(one.transforms.svg.inject, 'svg:inject:prod')
            }
        }
    };

    // COMMON LINKS

    one.link(one.sources.jade).to(one.transforms.jade.preprocess);
    one.link(one.sources.markdown).to(one.transforms.markdown.preprocess);

    one.link(one.sources.css).to(one.transforms.css.autoprefix);
    one.link(one.sources.scss).to(one.transforms.scss.preprocess);
    one.link(one.transforms.scss.preprocess).to(one.transforms.css.autoprefix);
    one.link(one.sources.less).to(one.transforms.less.preprocess);
    one.link(one.transforms.less.preprocess).to(one.transforms.css.autoprefix);
    one.link(one.sources.stylus).to(one.transforms.stylus.preprocess);
    one.link(one.transforms.stylus.preprocess).to(one.transforms.css.autoprefix);
    one.link(one.transforms.css.autoprefix).to(one.transforms.css.sortByDepth);

    one.link(one.sources.javascript).to(one.transforms.javascript.sortByDepth);
    one.link(one.sources.typescript).to(one.transforms.typescript.preprocess);
    one.link(one.transforms.typescript.preprocess).to(one.transforms.javascript.sortByDepth);
    one.link(one.sources.coffeescript).to(one.transforms.coffeescript.preprocess);
    one.link(one.transforms.coffeescript.preprocess).to(one.transforms.javascript.sortByDepth);

    one.link(one.sources.svg).to(one.transforms.svg.rename);
    one.link(one.transforms.svg.rename).to(one.transforms.svg.minify);
    one.link(one.transforms.svg.minify).to(one.transforms.svg.store);

    // DEV LINKS

    one.link(one.sources.html).to(one.transforms.injectDev);
    one.link(one.transforms.jade.preprocess).to(one.transforms.injectDev);
    one.link(one.transforms.markdown.preprocess).to(one.transforms.injectDev);

    one.link(one.sources.bower.css).to(one.transforms.injectDev, { primary: false });
    one.link(one.sources.bower.js).to(one.transforms.injectDev, { primary: false });
    one.link(one.transforms.css.sortByDepth).to(one.transforms.injectDev, { primary: false });
    one.link(one.transforms.javascript.sortByDepth).to(one.transforms.injectDev, { primary: false });

    one.link(one.transforms.injectDev).to(one.outputs.writeToDev);
    one.link(one.transforms.css.autoprefix).to(one.outputs.writeToDev);
    one.link(one.transforms.coffeescript.preprocess).to(one.outputs.writeToDev);
    one.link(one.transforms.typescript.preprocess).to(one.outputs.writeToDev);

    one.link(one.outputs.writeToDev).to(one.outputs.browserSync);
    one.link(one.sources.javascript).to(one.outputs.browserSync);
    one.link(one.sources.json).to(one.outputs.browserSync);
    one.link(one.sources.images).to(one.outputs.browserSync);

    one.link(one.transforms.svg.store).to(one.clonedTransforms.svg.inject.dev, { primary: false });
    one.after(one.transforms.injectDev).insert(one.clonedTransforms.svg.inject.dev);


    // PROD LINKS

    one.link(one.sources.html).to(one.transforms.injectProd);
    one.link(one.transforms.jade.preprocess).to(one.transforms.injectProd);
    one.link(one.transforms.markdown.preprocess).to(one.transforms.injectProd);
    one.link(one.transforms.injectProd).to(one.transforms.html.minify);
    one.link(one.transforms.html.minify).to(one.outputs.writeToProd);

    one.link(one.sources.bower.css).to(one.transforms.css.concat);
    one.link(one.transforms.css.sortByDepth).to(one.transforms.css.concat);
    one.link(one.transforms.css.concat).to(one.transforms.css.minify);
    one.link(one.transforms.css.concat).to(one.transforms.injectProd, { primary: false });
    one.link(one.transforms.css.minify).to(one.outputs.writeToProd);

    one.link(one.sources.bower.js).to(one.transforms.javascript.concat);
    one.link(one.transforms.javascript.sortByDepth).to(one.transforms.javascript.concat);
    one.link(one.transforms.javascript.concat).to(one.transforms.javascript.minify);
    one.link(one.transforms.javascript.concat).to(one.transforms.injectProd, { primary: false });
    one.link(one.transforms.javascript.minify).to(one.outputs.writeToProd);

    one.link(one.sources.json).to(one.transforms.json.minify);
    one.link(one.transforms.json.minify).to(one.outputs.writeToProd);

    one.link(one.sources.images).to(one.transforms.images.minify);
    one.link(one.transforms.images.minify).to(one.outputs.writeToProd);

    one.link(one.transforms.svg.store).to(one.clonedTransforms.svg.inject.prod, { primary: false });
    one.after(one.transforms.injectProd).insert(one.clonedTransforms.svg.inject.prod);

    // TASKS

    gulp.task('browserSync', function () {
        return one.run(one.outputs.browserSync);
    });

    gulp.task('serve', ['browserSync'], function () {
        servers.startStatic(one.options);
        servers.startBrowserSync(one.options);
    });

    gulp.task('watch', function () {

        let debouncedBrowserSync = _.debounce(() => {
            one.run(one.outputs.browserSync);
        }, 100);

        let watchRun = (eventName, path) => {
            if (eventName === 'unlink') {
                one.cache.forget(path);
            }

            debouncedBrowserSync();
        };

        let watchPaths = _([[options.src], options.watchPaths]).chain()
            .flatten()
            .compact()
            .value();

        watcher.watch(watchPaths, watchRun);
    });

    gulp.task('writeToDev', function () {
        let rimraf = require('rimraf');
        rimraf.sync(one.options.dev);
        return one.run(one.outputs.writeToDev);
    });

    gulp.task('writeToProd', function () {
        let rimraf = require('rimraf');
        rimraf.sync(one.options.prod);
        return one.run(one.outputs.writeToProd);
    });

    gulp.task('graph', function (done) {
        one.renderGraph('dot', './one-gulp-streams-graph.svg', done);
    });
};

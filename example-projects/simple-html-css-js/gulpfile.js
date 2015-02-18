'use strict';

var gulp = require('gulp'),
    one = require('one-gulp');

one.init(gulp, {

    //connectPort: 4001,
    //browserSyncPort: 4000,
    //bindHost: '0.0.0.0'

    //cssDeps: [
    //    {
    //        bowerInclude: '**/*.css',
    //        output: 'bower-styles.css'
    //    },
    //    {
    //        srcInclude: ['**/*.css'],
    //        exclude: ['skin/**/*.css'],
    //        output: 'all-styles.css'
    //    }
    //]

    cssDeps: [

    ]

});

one.link(one.sources.html).to(one.transforms.injectDev);

one.link(one.sources.css).to(one.transforms.groupAndSortCss);
one.link(one.sources.less).to(one.transforms.less);
one.link(one.sources.scss).to(one.transforms.sass);
one.link(one.transforms.less).to(one.transforms.groupAndSortCss);
one.link(one.transforms.sass).to(one.transforms.groupAndSortCss);

one.link(one.sources.js).to(one.transforms.injectDev, { primary: false });

one.link(one.transforms.groupAndSortCss).to(one.transforms.injectDev, { primary: false });

one.link(one.transforms.less).to(one.outputs.writeToDev);
one.link(one.transforms.sass).to(one.outputs.writeToDev);
one.link(one.transforms.injectDev).to(one.outputs.writeToDev);

one.link(one.outputs.writeToDev).to(one.outputs.browserSync);
one.link(one.sources.js).to(one.outputs.browserSync);
one.link(one.sources.css).to(one.outputs.browserSync);
one.link(one.sources.images).to(one.outputs.browserSync);

one.link(one.transforms.groupAndSortCss).to(one.transforms.concatCss);
one.link(one.transforms.concatCss).to(one.outputs.writeToProd);
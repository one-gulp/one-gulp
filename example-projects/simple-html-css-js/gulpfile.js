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
        {
            bowerInclude: '**/*.css',
            output: 'bower-styles.css'
        },
        {
            srcInclude: ['skin/*.css'],
            sort: ['skin/layout.css'],
            output: 'skin-styles.css'
        },
        {
            srcInclude: ['**/*.css'],
            exclude: ['skin/*.css', 'zzz.css'],
            output: 'all-styles.css'
        }
    ]

});
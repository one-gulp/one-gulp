'use strict';

var one = require('one-gulp'),
    gulp = require('gulp');

one.init(gulp, {

    cssDeps: [
        {
            include: ['bower_components/**/*.css'],
            output: 'bower-styles.css'
        },
        {
            include: ['zzz.css', 'skin/*.css', '**/*.css'],
            exclude: ['bower_components/**/*.css', 'ddd.css'],
            output: 'all-styles.css'
        }
    ],

    jsDeps: [
        {
            include: ['bower_components/**/*.js'],
            output: 'bower-scripts.js'
        },
        {
            include: ['gallery/*.js', 'index.js', '**/*.js'],
            exclude: ['bower_components/**/*.js'],
            output: 'all-scripts.js'
        }
    ],

    watchPaths: [
        'bower_components'
    ]

});
'use strict';

var gulp = require('gulp'),
    one = require('one-gulp');

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
            include: ['**/*.js'],
            exclude: ['bower_components/**/*.js'],
            output: 'all-scripts.js'
        }
    ]

});

//one.unlink(one.sources.images).from(one.transforms.imagemin);
//one.unlink(one.transforms.imagemin).from(one.outputs.writeToProd);
//one.link(one.sources.images).to(one.outputs.writeToProd);

//one.remove(one.transforms.imagemin);
//one.remove(one.transforms.autoprefix);

//var custom = {
//    foobar: function (css) {
//        return css;
//    }
//};
//one.load(custom);

//one.replace(one.transforms.autoprefix).by(custom.foobar);
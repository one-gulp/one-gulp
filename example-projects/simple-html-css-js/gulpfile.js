'use strict';

var gulp = require('gulp'),
    one = require('one-gulp');

var sass = require('gulp-sass');

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

function link() {
    return {
        to: function () {

        }
    }
}

function from() {
    return {
        unlink: function () {

        },
        andReplaceBy: function () {

        }
    }
}

function remove() {

}

// enlever l'autoprefix
remove(tfAutoprefix);

// LESS

function less() {
    return gulp.src('**/*.less', { cwd: one.options.dev, nodir: true });
}

function tfLess(less) {
    return less.pipe($.less());
}

// ajouter less en plus

link(less)
    .to(tfLess);

link(tfLess)
    .to(tfAutoprefix);

// remplacer sass par less

link(less)
    .to(tfLess);

from(tfAutoprefix)
    .unlink(tfSass)
    .andReplaceBy(tfLess);

// ajouter ngAnnotate

function tfNgAnnotate(js) {
    return js.pipe($.ngAnnotate());
}

link(js)
    .to(tfNgAnnotate);

from(tfInjectsProd)
    .unlink(js)
    .andReplaceBy(tfNgAnnotate);

// ajouter html2js/concat

// -- redefine html
function html() {
    return gulp.src('*.html', { cwd: one.options.dev, nodir: true });
}

function views() {
    return gulp.src('**/*.view.html', { cwd: one.options.dev, nodir: true });
}

function tfHtml2js(html) {
    return html.pipe($.html2js());
}

link(views)
    .to(tfHtml2js);

link(tfHtml2js)
    .to(tfMinifyJs);

// ajouter appInformation/ngConstant

function appInformation() {
    return gulp.src('appInformations.json', { cwd: one.options.dev, nodir: true });
}

function tfNgConstant() {
    return gulp.src('appInformations.json', { cwd: one.options.dev, nodir: true });
}

link(appInformation)
    .to(tfNgConstant);

link({ files: tfNgConstant })
    .to(tfInjectsDev);

link(tfNgConstant)
    .to(tfMinifyJs);
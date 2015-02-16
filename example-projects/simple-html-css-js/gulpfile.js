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


// enlever l'autoprefix

//remove(tfAutoprefix);
//
//// équivalent de :
//
//unlink(css).from(tfAutoprefix);
//unlink(tfSass).from(tfAutoprefix);
//
//unlink(tfAutoprefix).from(tfInjectsDev);
//link(css).to(tfInjectsDev);
//link(tfSass).top(tfInjectsDev);
//
//unlink(tfAutoprefix).from(writeToDev);
//link(css).to(writeToDev);
//link(tfSass).to(writeToDev);
//
//unlink(tfAutoprefix).from(tfMinifyCss);
//link(css).to(tfMinifyCss);
//link(tfSass).to(tfMinifyCss);
//
//
//// LESS
//
//function less() {
//    return gulp.src('**/*.less', { cwd: one.options.dev, nodir: true });
//}
//
//function tfLess(less) {
//    return less.pipe($.less());
//}
//
//// ajouter less en plus
//
//link(less).to(tfLess);
//link(tfLess).to(tfAutoprefix);
//
//
//// remplacer sass par less
//
//link(less).to(tfLess);
//unlink(tfSass).from(tfAutoprefix);
//link(tfLess).to(tfAutoprefix);
//
//// ajouter ngAnnotate
//
//function tfNgAnnotate(js) {
//    return js.pipe($.ngAnnotate());
//}
//
//unlink(js).from(tfMinifyJs);
//link(js).to(tfNgAnnotate);
//link(tfNgAnnotate).to(tfMinifyJs);
//
//// ajouter html2js/concat
//
//
// -- redefine html (exemple)

var customFns = {

    rootHtml: function () {
        return gulp.src('*.html', { cwd: one.options.dev, nodir: true });
    },

    views: function () {
        return gulp.src('views/*.html', { cwd: one.options.dev, nodir: true });
    },

    html2js: function (html) {
        return one.sources.js();
        //return html.pipe($.html2js());
    }
};

//one.load(customFns);

// TEST

one.link(one.sources.html).to(one.transforms.injectDev);
one.link(one.sources.css).to(one.transforms.injectDev, { secondary: true });
one.link(one.sources.js).to(one.transforms.injectDev, { secondary: true });

one.link(one.transforms.injectDev).to(one.outputs.writeToDev);

one.link(one.outputs.writeToDev).to(one.outputs.browserSync);
one.link(one.sources.js).to(one.outputs.browserSync);
one.link(one.sources.css).to(one.outputs.browserSync);
one.link(one.sources.images).to(one.outputs.browserSync);


//
//
//
//
//
//
//
//
//

//one.link(one.sources.other).to(one.outputs.browserSync);

//one.replace(one.sources.html).by(customFns.rootHtml);
//one.link(customFns.views).to(customFns.html2js);
//one.link(customFns.html2js).to(one.transforms.minifyJs);
//one.link(customFns.html2js).to(one.transforms.injectDev, true);

//// ajouter appInformation/ngConstant
//
//function appInformation() {
//    return gulp.src('appInformations.json', { cwd: one.options.dev, nodir: true });
//}
//
//function tfNgConstant() {
//}
//
//
//link(appInformation).to(tfNgConstant);
//link(tfNgConstant).to(tfInjectsDev);
//link(tfNgConstant).to(tfMinifyJs);
//
//
//// enlever l'autoprefix
//remove(tfAutoprefix);
//
//// LESS
//
//function less() {
//    return gulp.src('**/*.less', { cwd: one.options.dev, nodir: true });
//}
//
//function tfLess(less) {
//    return less.pipe($.less());
//}
//
//// ajouter less en plus
//
//link(less)
//    .to(tfLess);
//
//link(tfLess)
//    .to(tfAutoprefix);
//
//// remplacer sass par less
//
//link(less)
//    .to(tfLess);
//
//from(tfAutoprefix)
//    .unlink(tfSass)
//    .andReplaceBy(tfLess);
//
//// ajouter ngAnnotate
//
//function tfNgAnnotate(js) {
//    return js.pipe($.ngAnnotate());
//}
//
//link(js)
//    .to(tfNgAnnotate);
//
//from(tfInjectsProd)
//    .unlink(js)
//    .andReplaceBy(tfNgAnnotate);
//
//// ajouter html2js/concat
//
//// -- redefine html
//function html() {
//    return gulp.src('*.html', { cwd: one.options.dev, nodir: true });
//}
//
//function views() {
//    return gulp.src('**/*.view.html', { cwd: one.options.dev, nodir: true });
//}
//
//function tfHtml2js(html) {
//    return html.pipe($.html2js());
//}
//
//link(views)
//    .to(tfHtml2js);
//
//link(tfHtml2js)
//    .to(tfMinifyJs);
//
//// ajouter appInformation/ngConstant
//
//function appInformation() {
//    return gulp.src('appInformations.json', { cwd: one.options.dev, nodir: true });
//}
//
//function tfNgConstant() {
//    return gulp.src('appInformations.json', { cwd: one.options.dev, nodir: true });
//}
//
//link(appInformation)
//    .to(tfNgConstant);
//
//link({ files: tfNgConstant })
//    .to(tfInjectsDev);
//
//link(tfNgConstant)
//    .to(tfMinifyJs);
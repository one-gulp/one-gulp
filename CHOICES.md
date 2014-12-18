# Choices

## Serve

Connect plutôt qu'un truc tout fait genre node static => possibilité de brancher des middlewares facilement

## Watch and reload

Browser sync plus complet que live reload et on expose une version sans le sync sur le port 3001

## CSS optimization/minification

requirements

* sourcemaps
* efficient
* active/contributions/stars
* fast

17/12/2014

https://github.com/jonathanepollack/gulp-minify-css
    clean-css 1002* 1 da
    sourcemaps dans la 3.0
    le plus populaire des gulp plugins pour clean-css
    très optimisé pour la redondance

https://github.com/danielhusar/gulp-pleeease
    pleeease 236* 21 days
    gulp-sourcemap
    minification via node-csswring (pas bcp d'étoiles)
    beaucoup d'overhead avec les differentes optimisations

https://github.com/ayhankuru/gulp-crass
    crass 19* 1 month
    seems to be efficient
    no sourcemap
https://github.com/ben-eb/gulp-csso
    csso 933* 13 days
    seems to be efficient
    no sourcemap
https://github.com/torrottum/gulp-cssshrink
    cssshrink 912* 6 mois (jeune, pas bcp d'issue)
    no sourcemap
https://github.com/morishitter/gulp-csscss
    il faut ruby :-(

## HTML min

la référence de kangax html-minifier

collapseWhitespace: true,
conservativeCollapse: true,

=> pour les noob et les étourdis en display

preserveLineBreaks: false

=> bcp plus rare d'avoir whitespace pre que le cas d'avant

removeIgnored: false => underscore template and co.

removeEmptyElements: false sadly sometimes SPA, and dynamic pages uses this

minifyJS: false,
minifyCSS: false,

=> should be done with injections

minifyURLs: false too risky

## JS min

uglify duh

## concat

gulp-concat, the one (works with gulp sourcemaps)

## watch

complete : add, unlink, unlinkdir, change (works ok on linux)


## inclusion/exclusion/concat/order

WTF???


## gulp cache

https://github.com/wearefractal/gulp-cached
https://github.com/stolksdorf/gulp-delta
https://github.com/mogstad/gulp-content-cache
https://github.com/ahaurw01/gulp-remember
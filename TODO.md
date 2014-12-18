# TODO

* [DONE] classic inject
* [DONE] classic inject with reorder
* [DONE] classic inject en dev
* concatenation
* concatenation avec pattern vers fichiers multiples


* concatenation avec URL css qui marche
* bower inject

* local/outside [ALMOST DONE]
* mode local correct via browserSync

* favicon and icones ;-)

* Sourcemap pour uglify
* Sourcemap pour minifyCss

* preprocessing jade
* preprocessing scss
* preprocessing less
* preprocessing stylus
* preprocessing coffee
* preprocessing typescript
* preprocessing autprefixer
* bower inject
* sprites
* revision
* lint
* test

* nodir à la place de *.*

chokidar.watch('src', { persistent: true, ignoreInitial: true })

    .on('add', function () {
        // maj les injections si fichier js ou css ou html
    })

    .on('change', function (path) {
    })

    .on('unlink', function (path) {
        // maj les injections si fichier js ou css ou html
    })

    .on('unlinkDir', function (path) {
        // supprimer dossier
    })

    .on('error', function (error) {
    });

// { from: ['**/*.js'], to: ['all-scripts.css'], intoHead: true, async: true }

3 config

config fichier non voulus => ne pas les incluer
config l'ordre d'inclusion/import => ordre avec les patterns et le tableau
config la répartition une fois concaténé


zzz
main
skin/bg
skin/col

zzz-styles (zzz)
all-styles (main)
skin-styles (sking/bg, skin/col)

zzz
main
skin/bg
skin/col

all-styles (zzz, main)
skin-styles (sking/bg, skin/col)



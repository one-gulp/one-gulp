
buid-dev/injects
    preprocess/to-html
        preprocess/html
        preprocess/jade
        preprocess/markdown
    preprocess/to-css
        preprocess/css
        preprocess/scss
        preprocess/less
        preprocess/stylus
    preprocess/to-js
        preprocess/js
        preprocess/typescript
        preprocess/coffee

build-prod
    build-prod/injects
        preprocess/to-html
            preprocess/html
            preprocess/jade
            preprocess/markdown
        build-prod/css
            preprocess/to-css
                preprocess/css
                preprocess/scss
                preprocess/less
                preprocess/stylus
        build-prod/js
            preprocess/to-js
                preprocess/js
                preprocess/typescript
                preprocess/coffee
    build-prod/img
    build-prod/others





watch(.css)  =>         autoprefixer => write(tmp) => browserSync(file.css)
watch(.scss) => sass => autoprefixer => write(tmp) => browserSync(file.css)
watch(.less) => less => autoprefixer => write(tmp) => browserSync(file.css)
watch(.styl) => styl => autoprefixer => write(tmp) => browserSync(file.css)

watch(.js)     =>               write(tmp) => browserSync(file.js)
watch(.js)     => 6to5 =>       write(tmp) => browserSync(file.js)
watch(.ts)     => typescript => write(tmp) => browserSync(file.js)
watch(.coffee) => coffee     => write(tmp) => browserSync(file.js)


watch(.html)                       => inject(.css & .js) => write(tmp) => browserSync(file.html)
watch(.jade) => jade               => inject(.css & .js) => write(tmp) => browserSync(file.html)
watch(.md)   => markdown           => inject(.css & .js) => write(tmp) => browserSync(file.html)




watch(appInformation.json) => ngConstant => write(tmp) => browserSync(file.js)


watch(.html) => html2js => concat => write(tmp) => browserSync(file.js)
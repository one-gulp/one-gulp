# one-gulp


[WIP] a ready to use set of gulp tasks


## install

If your're starting a new project, you just need to run this :

`npm install gulp one-gulp --save`

This will install `gulp` and the `one-gulp` node module. If you don't have a `gulpfile.js` in your project, it will generate one with the minimum configuration.

## init

If you're already using gulp, you need to install the `one-gulp` node module by running this :

`npm install one-gulp --save`

and then you'll be able to init `one-gulp` with this code :

```javascript

var gulp = require('gulp'),
    one = require('one-gulp');

one.init(gulp, {
    // look at options documentation for details
});
```

The `one.init()` function adds several tasks to your gulp :

* serve
* watch
* writeToDev
* writeToProd
* browserSync
* graph

## config options

### src
### tmp
### dest
### connectPort
### browserSyncPort
### bindHost
### sortDeps // relative to src
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

## Remote debugging

### Using browser's tools

Chrome, Firefox, Opera and Safari provide remote debugging for their latest desktop and mobile browsers :

* [Remote Debugging on Android with Chrome][chrome-remote-debug]
* [Debugging Firefox for Android with WebIDE][firefox-remote-debug]
* [Remote Debugging with Opera Dragonfly][opera-remote-debug]
* [Enable Remote Debugging with Safari Web Inspector in iOS 6][safari-remote-debug]

### Using weinre

If you need to remote debug older versions of the above browsers, Internet Explorer or a WebView, you'll have to use [weinre].

**one-gulp** uses BrowserSync, so weinre is already installed. You just need to add a target script in your pages and enable the debug interface.

#### Manual target script injection

If you want weinre to work, you can manually add a target script like this in your pages :

```html
<script src="//[your-local-IP]:[options.weinrePort]/target/target-script-min.js#browsersync"></script>
```

#### Automatic target script injection

You can also set `options.injectWeinreSnippet` to `true` to automatically inject the weinre target script in your pages. This will only work on the BrowserSync port.

#### Enable the debugger

By default, after starting the servers, weinre is disabled. To enable it, just follow these two steps :

1. Open *http://[your-local-ip]:[browser-sync-conf-port]/remote-debug* and enable **Remote Debugger (weinre)**.
1. Click on the **Access remote debugger (opens in a new tab)**.

[weinre]: http://people.apache.org/~pmuellr/weinre/docs/latest/  "Weinre documentation website"
[chrome-remote-debug]: https://developer.chrome.com/devtools/docs/remote-debugging "Remote Debugging on Android with Chrome"
[firefox-remote-debug]: https://developer.mozilla.org/en-US/docs/Tools/Remote_Debugging/Debugging_Firefox_for_Android_with_WebIDE "Debugging Firefox for Android with WebIDE"
[opera-remote-debug]: http://www.opera.com/dragonfly/documentation/remote/ "Opera Dragonfly documentation / Remote Debugging"
[safari-remote-debug]: http://moduscreate.com/enable-remote-web-inspector-in-ios-6/ "Enable Remote Debugging with Safari Web Inspector in iOS 6"
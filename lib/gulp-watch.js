'use strict';

var chokidar = require('chokidar'),
    spawn = require('child_process').spawn;

var task = process.argv[2]
var p;

function startTask() {

    // kill previous spawned process
    if (p) {
        p.kill();
    }

    // `spawn` a child `gulp` process linked to the parent `stdio`
    p = spawn('gulp', [task], { stdio: 'inherit' });
    console.log();
}

startTask();

var watcher = chokidar.watch(['gulpfile.js', 'node_modules/one-gulp/lib'], { persistent: true, ignoreInitial: true })
    .on('change', startTask);
'use strict';

var fs = require('fs'),
    path = require('path');

var input = path.join(__dirname, 'gulpfile-example.js'),
    output = path.join(__dirname, '../../..', 'gulpfile.js');

if (__dirname.match(/\/node_modules\/one-gulp\/postinstall$/)) {

    if (fs.existsSync(output)) {
        console.log('There is already a gulpfile.js in your project.\n');
    }
    else {

        fs.createReadStream(input).pipe(fs.createWriteStream(output));
        console.log('Basic gulpfile.js generated!\n');
    }
}
else {
    console.error('Cannot automatically create gulpfile.js when using npm link\n');
}

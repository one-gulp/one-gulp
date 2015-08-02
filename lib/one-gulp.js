'use strict';

// Handle Windows path use backslash
var babelOnly = __dirname;
if (!/^win/.test(process.platform)) {
    babelOnly = babelOnly.replace(/[\[\]\/{}()*+?.\\^$|-]/g, "\\$&")
}

require('babel/register')({
	ignore: false,
    only: babelOnly
});

module.exports = require('./one.js');
'use strict';

require('babel/register')({
	ignore: false,
    only: new RegExp('^' + __dirname.replace(/[\[\]\/{}()*+?.\\^$|-]/g, "\\$&"))
});

module.exports = require('./one.js');
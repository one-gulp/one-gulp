'use strict';

require('babel/register')({
    only: new RegExp('^' + __dirname.replace(/[\[\]\/{}()*+?.\\^$|-]/g, "\\$&"))
});

module.exports = require('./one.js');
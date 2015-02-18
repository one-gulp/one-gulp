'use strict';

var fs = require('fs');

module.exports = require('graphviz');

// fake window for viz
global.window = {};

require('../viz/viz.js');

var Viz = window.Viz;

delete global.window;

module.exports.renderToSvgFile = function (graph, renderer, filepath, callback) {

    var dot = graph.to_dot(),
        svg = Viz(dot, 'svg', renderer);

    fs.writeFile(filepath, svg, callback);
};

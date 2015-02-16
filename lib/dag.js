'use strict';

require('6to5/polyfill');

var uuid = require('uuid'),
    cached = require('gulp-cached'),
    plumber = require('gulp-plumber');

var _ = require('./underscore-mixins.js'),
    graphdot = require('./graphdot/graphdot');

var fnToNode = new Map();

exports.load = function (nodes) {

    _(nodes).forEach(function (fn, name) {

        fnToNode.set(fn, {
            name: name,
            id: uuid.v4(),
            fn: fn,
            inPrimaryLinks: [],
            inSecondaryLinks: [],
            outPrimaryLinks: [],
            outSecondaryLinks: []
        });
    });
};

exports.debug = function () {

    fnToNode.forEach(function (node) {
        console.log(
            _(node.inPrimaryLinks).pluck('name'),
            _(node.inSecondaryLinks).pluck('name'),
            node.name,
            _(node.outPrimaryLinks).pluck('name'),
            _(node.outSecondaryLinks).pluck('name')
        );
    });
};

exports.link = function (fn) {

    var node = fnToNode.get(fn);

    return {

        to: function (toFn, options) {

            options = options || {};

            var toNode = fnToNode.get(toFn);

            if (options.secondary === true) {
                toNode.inSecondaryLinks.push(node);
                node.outSecondaryLinks.push(toNode);
            } else {
                toNode.inPrimaryLinks.push(node);
                node.outPrimaryLinks.push(toNode);
            }
        }
    };
};

exports.unlink = function (fn) {

    var node = fnToNode.get(fn);

    return {

        from: function (fromFn) {

            var fromNode = fnToNode.get(fromFn);

            _(fromNode.inPrimaryLinks).remove(node);
            _(fromNode.inSecondaryLinks).remove(node);
            _(node.outPrimaryLinks).remove(fromNode);
            _(node.outSecondaryLinks).remove(fromNode);
        }
    };
};

exports.remove = function (fn) {

    var node = fnToNode.get(fn),
        todo = [];

    _(node.inPrimaryLinks).forEach(function (inNode) {

        todo.push(function () {
            exports.unlink(inNode.fn).from(node.fn);
        });

        _(node.outPrimaryLinks).forEach(function (outNode) {

            todo.push(function () {
                exports.unlink(node.fn).from(outNode.fn);
                exports.link(inNode.fn).to(outNode.fn);
            });
        });

        _(node.outSecondaryLinks).forEach(function (outNode) {

            todo.push(function () {
                exports.unlink(node.fn).from(outNode.fn);
                exports.link(inNode.fn).to(outNode.fn, true);
            });
        });
    });

    _(node.inSecondaryLinks).forEach(function (inNode) {

        todo.push(function () {
            exports.unlink(inNode.fn).from(node.fn);
        });
    });

    _(todo).invoke('call');
};

exports.replace = function (fn) {

    var node = fnToNode.get(fn),
        todo = [];

    return {

        by: function (byFn) {

            _(node.inPrimaryLinks).forEach(function (inNode) {

                todo.push(function () {
                    exports.unlink(inNode.fn).from(node.fn);
                    exports.link(inNode.fn).to(byFn);
                });
            });

            _(node.inSecondaryLinks).forEach(function (inNode) {

                todo.push(function () {
                    exports.unlink(inNode.fn).from(node.fn);
                    exports.link(inNode.fn).to(byFn, true);
                });
            });

            _(node.outPrimaryLinks).forEach(function (outNode) {

                todo.push(function () {
                    exports.unlink(node.fn).from(outNode.fn);
                    exports.link(byFn).to(outNode.fn);
                });
            });

            _(node.outSecondaryLinks).forEach(function (outNode) {

                todo.push(function () {
                    exports.unlink(node.fn).from(outNode.fn);
                    exports.link(byFn).to(outNode.fn, true);
                });
            });

            _(todo).invoke('call');
        }
    }
};

var runEntryNode;

function linksToStream(links) {

    return _(links).chain()
        .pluck('fn')
        .map(exports.run)
        .compact()
        .mergeStreams()
        .value()
        .pipe(plumber());
}

function isStream(stream) {
    return stream != null && typeof stream.on === 'function';
}

exports.run = function (fn) {

    var result,
        node = fnToNode.get(fn);

    runEntryNode = runEntryNode || node;

    if (node.lastResult != null) {
        return node.lastResult;
    }

    var primaryStream = linksToStream(node.inPrimaryLinks),
        secondaryStream = linksToStream(node.inSecondaryLinks);

    result = fn(primaryStream, secondaryStream);

    if (isStream(result)) {
        result = result.pipe(cached(node.id, { optimizeMemory: false }));
    }

    if (runEntryNode === node) {
        fnToNode.forEach(function (node) {
            delete node.lastResult;
        });
    }
    else {
        node.lastResult = result;
    }

    return result;
};

function isNotAlone(node) {

    return (node.inPrimaryLinks.length +
        node.inSecondaryLinks.length +
        node.outPrimaryLinks.length +
        node.outSecondaryLinks.length) > 0
}

function isSource(node) {
    return _(node.inPrimaryLinks).isEmpty() && _(node.inSecondaryLinks).isEmpty();
}

function isOutput(node) {
    return _(node.outPrimaryLinks).isEmpty() && _(node.outSecondaryLinks).isEmpty();
}

exports.renderGraph = function (renderer, filepath, callback) {

    var graph = graphdot.digraph('one_gulp_streams_graph');

    graph.set('label', 'one-gulp streams graph\n\n');
    graph.set('fontname', 'sans-serif');
    graph.set('fontsize', '20');
    graph.set('labelloc', 't');

    graph.set('pad', '0.5,0.5');
    graph.set('nodesep', '0.3');
    graph.set('splines', 'spline');
    graph.set('ranksep', '1');
    graph.set('rankdir', 'LR');

    fnToNode.forEach(function (node) {

        var nodeOptions = {
            label: node.name,
            shape: 'rectangle',
            fontname: 'sans-serif',
            style: 'bold',
            margin: '0.2,0.1'
        };

        if (isSource(node)) {

            nodeOptions.shape = 'ellipse';
            nodeOptions.color = 'mediumslateblue';
            nodeOptions.fontcolor = 'mediumslateblue';
            nodeOptions.margin = '0.1,0.1';
        }

        if (isOutput(node)) {

            nodeOptions.color = 'limegreen';
            nodeOptions.fontcolor = 'white';
            nodeOptions.style = 'filled';
            nodeOptions.margin = '0.25,0.25';
        }

        if (isNotAlone(node)) {
            node.graphNode = graph.addNode(node.id, nodeOptions);
        }
    });

    fnToNode.forEach(function (node) {

        _(node.inPrimaryLinks).forEach(function (linkedNode) {

            var edgeOptions = {};

            if (isSource(linkedNode)) {
                edgeOptions.color = 'mediumslateblue';
            }

            graph.addEdge(linkedNode.graphNode, node.graphNode, edgeOptions);
        });

        _(node.inSecondaryLinks).forEach(function (linkedNode) {

            graph.addEdge(linkedNode.graphNode, node.graphNode, {
                color: 'gray',
                style: 'dashed'
            });
        });
    });

    graphdot.renderToSvgFile(graph, renderer, filepath, callback);
};
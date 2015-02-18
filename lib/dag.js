'use strict';

var uuid = require('uuid'),
    plumber = require('gulp-plumber');

var _ = require('./underscore-mixins.js'),
    graphdot = require('./graphdot.js');

var fnToNode = new Map();

exports.load = function (nodes) {

    _(nodes).forEach(function (fn, name) {

        fnToNode.set(fn, {
            name: name,
            id: uuid.v4(),
            fn: fn,
            ingoingLinks: new Map(),
            outgoingLinks: new Map()
        });
    });
};

exports.debug = function () {

    fnToNode.forEach(function (node) {
        console.log(
            _(node.ingoingLinks).pluck('node').pluck('name'),
            node.name,
            _(node.outgoingLinks).pluck('node').pluck('name')
        );
    });
};

var defaultLinkOptions = {
    primary: true
};

exports.link = function (fn) {

    var node = fnToNode.get(fn);

    return {

        to: function (toFn, options) {

            options = _(options || {}).defaults(defaultLinkOptions);

            var toNode = fnToNode.get(toFn);

            toNode.ingoingLinks.set(node, options);
            node.outgoingLinks.set(node, options);
        }
    };
};

exports.unlink = function (fn) {

    var node = fnToNode.get(fn);

    return {

        from: function (fromFn) {

            var fromNode = fnToNode.get(fromFn);

            _(fromNode.ingoingLinks).remove(node);
            _(fromNode.inSecondaryLinks).remove(node);
            _(node.outgoingLinks).remove(fromNode);
            _(node.outSecondaryLinks).remove(fromNode);
        }
    };
};

exports.remove = function (fn) {

    var node = fnToNode.get(fn),
        todo = [];

    _(node.ingoingLinks).forEach(function (inNode) {

        todo.push(function () {
            exports.unlink(inNode.fn).from(node.fn);
        });

        _(node.outgoingLinks).forEach(function (outNode) {

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

            _(node.ingoingLinks).forEach(function (inNode) {

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

            _(node.outgoingLinks).forEach(function (outNode) {

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

    var primaryStreams = [],
        secondaryStreams = [];

    node.ingoingLinks.forEach(function (options, node) {
        if (options.primary) {
            primaryStreams.push(node);
        } else {
            secondaryStreams.push(node);
        }
    });

    var primaryStream = linksToStream(primaryStreams),
        secondaryStream = linksToStream(secondaryStreams);

    result = fn(primaryStream, secondaryStream);

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
    return (node.ingoingLinks.size + node.outgoingLinks.size) > 0;
}

function isSource(node) {
    return node.ingoingLinks.size === 0;
}

function isOutput(node) {
    return node.outgoingLinks.size === 0;
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

        node.ingoingLinks.forEach(function (options, linkedNode) {

            var edgeOptions = {};

            if (options.primary) {
                edgeOptions.penwidth = '1.5';
            } else {
                edgeOptions.arrowhead = 'empty';
                edgeOptions.style = 'dashed';
            }

            if (isSource(linkedNode)) {
                edgeOptions.color = 'mediumslateblue';
            }

            graph.addEdge(linkedNode.graphNode, node.graphNode, edgeOptions);
        });
    });

    graphdot.renderToSvgFile(graph, renderer, filepath, callback);
};
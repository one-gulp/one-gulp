'use strict';

var _ = require('./underscore-mixins.js');

var fnToNode = new Map();

exports.load = function (nodes, prefix) {

    let uuid = require('uuid');

    if (prefix != null && prefix.length > 0) {
        prefix = prefix + ':';
    } else {
        prefix = '';
    }

    _(nodes).forEach(function (fn, name) {

        if (_.isFunction(fn)) {
            fnToNode.set(fn, {
                name: prefix + name,
                id: uuid.v4(),
                fn: fn,
                ingoingLinks: new Map(),
                outgoingLinks: new Map(),
                counter: 0
            });
        } else {
            exports.load(fn, name);
        }
    });
};

exports.clone = function (fn, name) {

    var node = fnToNode.get(fn);
    var newNodeLoader = {};

    newNodeLoader[name] = node.fn.bind({});

    exports.load(newNodeLoader);

    return newNodeLoader[name];
};

exports.debug = function () {

    fnToNode.forEach(function (node) {
        console.log(
            _(Array.from(node.ingoingLinks.keys())).pluck('name'),
            node.name,
            _(Array.from(node.outgoingLinks.keys())).pluck('name')
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
            node.outgoingLinks.set(toNode, options);
        }
    };
};

exports.unlink = function (fn) {

    var node = fnToNode.get(fn);

    return {

        from: function (fromFn) {

            var fromNode = fnToNode.get(fromFn);

            fromNode.ingoingLinks.delete(node);
            node.outgoingLinks.delete(fromNode);
        }
    };
};

exports.remove = function (fn) {

    var node = fnToNode.get(fn),
        todo = [];

    node.ingoingLinks.forEach(function (inOptions, inNode) {

        todo.push(function () {
            exports.unlink(inNode.fn).from(fn);
        });

        node.outgoingLinks.forEach(function (outOptions, outNode) {

            todo.push(function () {
                exports.unlink(fn).from(outNode.fn);
                exports.link(inNode.fn).to(outNode.fn, outOptions);
            });
        });
    });

    _(todo).invoke('call');
};

exports.replace = function (fn) {

    var node = fnToNode.get(fn),
        todo = [];

    return {

        by: function (byFn) {

            node.ingoingLinks.forEach(function (inOptions, inNode) {

                todo.push(function () {
                    exports.unlink(inNode.fn).from(node.fn);
                    exports.link(inNode.fn).to(byFn, inOptions);
                });
            });

            node.outgoingLinks.forEach(function (outOptions, outNode) {

                todo.push(function () {
                    exports.unlink(node.fn).from(outNode.fn);
                    exports.link(byFn).to(outNode.fn, outOptions);
                });
            });

            _(todo).invoke('call');
        }
    }
};

exports.before = function (fn) {

    var node = fnToNode.get(fn),
        todo = [];

    return {

        insert: function (beforeFn) {

            node.ingoingLinks.forEach(function (inOptions, inNode) {

                todo.push(function () {
                    exports.unlink(inNode.fn).from(node.fn);
                    exports.link(inNode.fn).to(beforeFn, inOptions);
                });
            });

            todo.push(function () {
                exports.link(beforeFn).to(node.fn);
            });

            _(todo).invoke('call');
        }
    };
};

exports.after = function (fn) {

    var node = fnToNode.get(fn),
        todo = [];

    return {

        insert: function (afterFn) {

            node.outgoingLinks.forEach(function (outOptions, outNode) {

                todo.push(function () {
                    exports.unlink(node.fn).from(outNode.fn);
                    exports.link(afterFn).to(outNode.fn, outOptions);
                });
            });

            todo.push(function () {
                exports.link(node.fn).to(afterFn);
            });

            _(todo).invoke('call');
        }
    };
};

var runEntryNode;

function linksToStream(links) {
    let plumber = require('gulp-plumber');

    return _(links).chain()
        .pluck('fn')
        .map(exports.run)
        .compact()
        .concatVinylStreams()
        .value()
        .pipe(plumber());
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

    let graphdot = require('./graphdot.js');

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

    var promises = [];

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
            nodeOptions.color = 'lavender';
            nodeOptions.fontcolor = 'lavender';
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

            if (isSource(node)) {

                var donePromise = new Promise(function (resolve, reject) {

                    node.fn()
                        .on('data', function () {
                            node.counter += 1;
                            node.graphNode.set('color', 'mediumslateblue');
                            node.graphNode.set('fontcolor', 'mediumslateblue');
                            node.graphNode.set('label', node.name + ' (' + node.counter + ')');
                        })
                        .on('error', reject)
                        .on('end', resolve);
                });

                promises.push(donePromise);
            }
        }
    });

    Promise.all(promises).then(function () {
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
                    edgeOptions.color = linkedNode.graphNode.get('color');
                }

                graph.addEdge(linkedNode.graphNode, node.graphNode, edgeOptions);
            });
        });

        graphdot.renderToSvgFile(graph, renderer, filepath, callback);
    });
};
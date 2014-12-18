'use strict';

var Readable = require('stream').Readable;

module.exports = function (streams) {

    var mergedVinyStream = new Readable({ objectMode: true });

    var files = [],
        counters = [],
        ended = [],
        currentIndex = 0;

    var allEnded = false,
        pushNextLater = false;

    streams.forEach(function (stream, streamIdx) {

        counters[streamIdx] = 0;
        ended[streamIdx] = false;

        stream.on('data', function (file) {

            var previousCounters = 0;

            for (var i = 0; i <= streamIdx; i++) {
                previousCounters += counters[i];
            }

            files.splice(previousCounters, 0, file.clone({ contents: false }));
            counters[streamIdx] += 1;
        });

        stream.on('end', function () {

            ended[streamIdx] = true;

            allEnded = ended.every(function (ended) {
                return ended;
            });

            if (allEnded && pushNextLater) {
                pushNext();
                pushNextLater = false;
            }
        });
    });

    function pushNext() {

        if (currentIndex < files.length) {
            mergedVinyStream.push(files[currentIndex++]);
        }
        else {
            mergedVinyStream.push(null);
        }
    }

    mergedVinyStream._read = function () {

        if (allEnded) {
            pushNext();
        }
        else {
            pushNextLater = true;
        }

    };

    return mergedVinyStream;
};
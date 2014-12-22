'use strict';

var expect = require('expect.js');

var _ = require('../lib/underscore-mixins.js');

describe('underscore-mixins', function () {

    describe('concat(item)', function () {

        it('should insert one item at the end', function () {

            // given
            var array = ['a', 'b', 'c'];

            // when
            var result = _(array).concat('d');

            // then
            expect(array).to.eql(['a', 'b', 'c']);
            expect(result).to.eql(['a', 'b', 'c', 'd']);
        });

        it('should insert many items at the end', function () {

            // given
            var array = ['a', 'b', 'c'];

            // when
            var result = _(array).concat(['d', 'e']);

            // then
            expect(array).to.eql(['a', 'b', 'c']);
            expect(result).to.eql(['a', 'b', 'c', 'd', 'e']);
        });
    });
});
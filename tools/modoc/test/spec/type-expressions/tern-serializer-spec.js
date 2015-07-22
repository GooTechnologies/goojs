'use strict';

var typeParser = require('../../../src/type-expressions/type-parser');
var ternSerializer = require('../../../src/type-expressions/tern-serializer');

describe('tern-serializer', function () {
	var parse = typeParser.parse;
	var serialize = ternSerializer.serialize;

	// would like a compose function
	var convert = function (string) {
		return serialize(parse(string));
	};

	describe('serialize', function () {
		it('serializes primitive types', function () {
			expect(convert('number')).toEqual('number');
			expect(convert('string')).toEqual('string');

			// boolean is bool in tern because...
			expect(convert('boolean')).toEqual('bool');
		});

		it('serializes the * types', function () {
			expect(convert('*')).toEqual('?');
		});

		it('serializes arrays', function () {
			expect(convert('Array')).toEqual('[?]');
			expect(convert('Array<number>')).toEqual('[number]');
		});

		it('serializes objects', function () {
			expect(convert('{ a }')).toEqual('{ a }');
			expect(convert('{ a: number, b: boolean }')).toEqual('{ a: number, b: bool }');
		});
	});
});
// jshint node:true
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

		it('serializes nullable and optional types (bindings)', function () {
			expect(convert('{ ?a }')).toEqual('{ a? }');
			expect(convert('{ a= }')).toEqual('{ a? }');
			expect(convert('{ ?a= }')).toEqual('{ a? }');
		});

		it('serializes the * types', function () {
			expect(convert('*')).toEqual('?');
		});

		it('serializes arrays', function () {
			expect(convert('Array')).toEqual('[?]');
			expect(convert('Array<number>')).toEqual('[number]');
		});

		it('serializes classes', function () {
			expect(convert('Promise')).toEqual('+Promise');
		});

		it('serializes objects', function () {
			expect(convert('{ a }')).toEqual('{ a }');
			expect(convert('{ a: number, b: boolean }')).toEqual('{ a: number, b: bool }');
		});

		it('serializes functions', function () {
			expect(convert('function ()')).toEqual('fn ()');
			expect(convert('function () : number')).toEqual('fn () -> number');
			expect(convert('function (a)')).toEqual('fn (a)');
			expect(convert('function (a: number, b: string)')).toEqual('fn (a: number, b: string)');
		});

		it('serializes either types', function () {
			expect(convert('(number|string)')).toEqual('number|string');
		});

		it('serializes composed types', function () {
			expect(convert('Array<Array<number>>')).toEqual('[[number]]');
			expect(convert('function (a: Array, b: function (c) : *) : *'))
				.toEqual('fn (a: [?], b: fn (c) -> ?) -> ?');
			expect(convert('Array<{ a: Array<number> }>')).toEqual('[{ a: [number] }]');
		});
	});
});
// jshint node:true
'use strict';

var typeParser = require('../../../src/type-expressions/type-parser');
var ternSerializer = require('../../../src/type-expressions/tern-serializer');

describe('tern-serializer', function () {
	var parse = typeParser.parse;
	var serialize = ternSerializer.serialize;

	// would like a compose function
	var convert = function (string) {
		return serialize(parse(string), { _forceCounter: 0 });
	};

	var pair = function (serialized, definitions) {
		return {
			serialized: serialized,
			definitions: definitions || {}
		};
	};

	describe('serialize', function () {
		it('serializes primitive types', function () {
			expect(convert('number')).toEqual(pair('number'));
			expect(convert('string')).toEqual(pair('string'));

			// boolean is bool in tern because...
			expect(convert('boolean')).toEqual(pair('bool'));
		});

		// this is useless, there is no such thing as objects in tern
		xit('serializes nullable and optional types (bindings)', function () {
			expect(convert('{ ?a }')).toEqual('{ a? }');
			expect(convert('{ a= }')).toEqual('{ a? }');
			expect(convert('{ ?a= }')).toEqual('{ a? }');
		});

		it('serializes the * types', function () {
			expect(convert('*')).toEqual(pair('?', {}));
		});

		it('serializes arrays', function () {
			expect(convert('Array')).toEqual(pair('[?]'));
			expect(convert('Array<number>')).toEqual(pair('[number]'));
		});

		it('serializes classes', function () {
			expect(convert('Promise')).toEqual(pair('+Promise'));
		});

		it('serializes objects', function () {
			expect(convert('{ a }')).toEqual(pair(
				'_t_0',
				{
					'_t_0': {
						'a': '?'
					}
				}));

			expect(convert('{ a: number, b: boolean }')).toEqual(pair(
				'_t_0',
				{
					'_t_0': {
						'a': 'number',
						'b': 'bool'
					}
				}));
		});

		it('serializes functions', function () {
			expect(convert('function ()')).toEqual(pair('fn ()'));
			expect(convert('function () : number')).toEqual(pair('fn () -> number'));
			expect(convert('function (a)')).toEqual(pair('fn (a: ?)'));
			expect(convert('function (a: number, b: string)')).toEqual(pair('fn (a: number, b: string)'));
		});

		it('serializes either types', function () {
			expect(convert('(number|string)')).toEqual(pair('number|string'));
		});

		it('serializes composed types', function () {
			expect(convert('Array<Array<number>>')).toEqual(pair('[[number]]'));

			expect(convert('function (a: Array, b: function (c) : *) : *'))
				.toEqual(pair('fn (a: [?], b: fn (c: ?) -> ?) -> ?'));

			expect(convert('Array<{ a: Array<number> }>')).toEqual(pair(
				'[_t_0]',
				{
					'_t_0' : {
						'a': '[number]'
					}
				}));

			expect(convert('{ a: { b: { c: number } } }')).toEqual(pair(
				'_t_0',
				{
					'_t_0' : {
						'a': '_t_1'
					},
					'_t_1' : {
						'b': '_t_2'
					},
					'_t_2' : {
						'c': 'number'
					}
				}));
		});
	});
});
// jshint node:true
'use strict';

var tokenizer = require('../../../src/type-expressions/tokenizer');

describe('tokenizer', function () {
	describe('tokenize', function () {
		var makeToken = tokenizer._makeToken;
		var tokenize = tokenizer.tokenize;

		var makeIdentifier = makeToken.bind(null, 'identifier');
		var makeSymbol = makeToken.bind(null, 'symbol');


		it('chops an identifier', function () {
			expect(tokenize('asd')).toEqual([makeIdentifier('asd')]);
			expect(tokenize('asd123')).toEqual([makeIdentifier('asd123')]);
			expect(tokenize('_asd_dsa_')).toEqual([makeIdentifier('_asd_dsa_')]);
		});

		it('chops a namespaced identifier', function () {
			expect(tokenize('asd.dsa.qwe')).toEqual([makeIdentifier('asd.dsa.qwe')]);
		});

		it('chops a ?-prefixed identifier', function () {
			var identifier = makeIdentifier('?asd');
			identifier.nullable = true;
			expect(tokenize('?asd')).toEqual([identifier]);
		});

		it('chops a =-suffixed identifier', function () {
			var identifier = makeIdentifier('asd=');
			identifier.optional = true;
			expect(tokenize('asd=')).toEqual([identifier]);
		});

		it('chops a ?-prefixed and =-suffixed identifier', function () {
			var identifier = makeIdentifier('?asd=');
			identifier.nullable = true;
			identifier.optional = true;
			expect(tokenize('?asd=')).toEqual([identifier]);
		});

		it('chops an more tokens', function () {
			expect(tokenize('asd123 *   dsa :')).toEqual([
				makeIdentifier('asd123'),
				makeSymbol('*'),
				makeIdentifier('dsa'),
				makeSymbol(':')
			]);
		});

		it('chops a real-world string', function () {
			// google closure compiler type expression format for a function
			expect(tokenize('function (s: string, times: number) : string')).toEqual([
				makeIdentifier('function'),
				makeSymbol('('),
				makeIdentifier('s'),
				makeSymbol(':'),
				makeIdentifier('string'),
				makeSymbol(','),
				makeIdentifier('times'),
				makeSymbol(':'),
				makeIdentifier('number'),
				makeSymbol(')'),
				makeSymbol(':'),
				makeIdentifier('string')
			]);
		});
	});
});
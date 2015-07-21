// jshint node:true
'use strict';

var tokenizer = require('../../../src/type-parser/tokenizer');

describe('tokenizer', function () {
	describe('tokenize', function () {
		var makeToken = tokenizer._makeToken;
		var tokenize = tokenizer.tokenize;

		var makeNumber = makeToken.bind(null, 'number');
		var makeIdentifier = makeToken.bind(null, 'identifier');
		var makeSymbol = makeToken.bind(null, 'symbol');


		it('chops a number', function () {
			expect(tokenize('123')).toEqual([makeNumber('123')]);
		});

		it('chops an identifier', function () {
			expect(tokenize('asd')).toEqual([makeIdentifier('asd')]);
		});

		it('chops a namespaced identifier', function () {
			expect(tokenize('asd.dsa.qwe')).toEqual([makeIdentifier('asd.dsa.qwe')]);
		});

		it('chops a ?-prefixed identifier', function () {
			expect(tokenize('?asd')).toEqual([makeIdentifier('?asd')]);
		});

		it('chops a =-suffixed identifier', function () {
			expect(tokenize('asd=')).toEqual([makeIdentifier('asd=')]);
		});

		it('chops a ?-prefixed and =-suffixed identifier', function () {
			expect(tokenize('?asd=')).toEqual([makeIdentifier('?asd=')]);
		});

		it('chops an more tokens', function () {
			expect(tokenize('asd 123 *   dsa :')).toEqual([
				makeIdentifier('asd'),
				makeNumber('123'),
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
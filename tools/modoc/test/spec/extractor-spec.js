'use strict';

var extractor = require('../../src/extractor');

describe('extractor', function () {
	var extract = extractor.extract;

	describe('constructors', function () {
		it('extracts nothing from an empty file', function () {
			var result = extract('', 'A.js');
			expect(result.constructor).toBeUndefined();
		});

		it('ignores functions named differently than the file', function () {
			var result = extract('function B() {}', 'A.js');
			expect(result.constructor).toBeUndefined();
		});

		it('extracts a constructor\'s signature', function () {
			var result = extract('function A() {}', 'A.js');
			expect(result.constructor).toEqual({
				name: 'A',
				params: [],
				rawComment: undefined
			});
		});

		it('extracts a constructor\'s signature even if it\'s followed by an _', function () {
			var result = extract('function A_() {}', 'A.js');
			expect(result.constructor).toEqual({
				name: 'A',
				params: [],
				rawComment: undefined
			});
		});

		it('extracts a constructor\'s signature when it\'s not top-level', function () {
			var result = extract('define([], function () { function A() {} return A; });', 'A.js');
			expect(result.constructor).toEqual({
				name: 'A',
				params: [],
				rawComment: undefined
			});
		});

		it('extracts a constructor\'s signature with parameters', function () {
			var result = extract('function A(a, b, c) {}', 'A.js');
			expect(result.constructor).toEqual({
				name: 'A',
				params: ['a', 'b', 'c'],
				rawComment: undefined
			});
		});

		it('extracts a constructor\'s signature with comments', function () {
			var result = extract('/** a comment */ function A() {}', 'A.js');
			expect(result.constructor).toEqual({
				name: 'A',
				params: [],
				rawComment: '* a comment '
			});
		});

		it('extracts a constructor\'s first jsdoc-like comment and ignores the rest', function () {
			var result = extract('/* phony! */ /** a comment */ // phony again!\nfunction A() {}', 'A.js');
			expect(result.constructor).toEqual({
				name: 'A',
				params: [],
				rawComment: '* a comment '
			});
		});
	});

	describe('members', function () {
		it('extracts members from a constructor', function () {
			var result = extract('function A() { /** asd */ this.a = 123; }', 'A.js');
			expect(result.members).toEqual([{
				name: 'a',
				rawComment: '* asd '
			}]);
		});

		it('ignores members from outside constructors', function () {
			var result = extract('function A() {} A.prototype.f = function () { /** asd */ this.a = 123; }', 'A.js');
			expect(result.members).toEqual([]);
		});

		it('extracts members from a constructor if they are not preceded by doc', function () {
			var result = extract('function A() { /* asd */ this.a = 123; }', 'A.js');
			expect(result.members).toEqual([]);
		});
	});

	describe('static members', function () {
		it('extracts static members', function () {
			var result = extract('/** asd */\nA.a = 123;', 'A.js');
			expect(result.staticMembers).toEqual([{
				name: 'a',
				rawComment: '* asd '
			}]);
		});

		it('ignores static members if they are not preceded by doc', function () {
			var result = extract('/* asd */\nA.a = 123;', 'A.js');
			expect(result.staticMembers).toEqual([]);
		});
	});

	describe('extraComments', function () {
		it('extracts all extra comments with an @target-class', function () {
			var result = extract('/** @target-class asd */\nA.a = 123;\n/** @target-class dsa */', 'A.js');
			expect(result.extraComments).toEqual([
				'* @target-class asd ',
				'* @target-class dsa '
			]);
		});

		it('ignores the rest', function () {
			var result = extract('/* @target-class asd */\nA.a = /* qwe */123;\n// @target-class dsa */', 'A.js');
			expect(result.extraComments).toEqual([]);
		});
	});
});
'use strict';

var dogma = require('../../src/dogma');

describe('dogma', function () {
	describe('partition', function () {
		var partition = dogma._partition;

		it('partitions tags with one entry each', function () {
			expect(partition('@a aaa\n@b bbb'))
			.toEqual({
				description: [''],
				'@a': ['aaa'],
				'@b': ['bbb']
			});
		});

		it('partitions tags with multiple entries', function () {
			expect(partition('@a aaa\n@a aa\n@b bbb\n@b bb'))
			.toEqual({
				description: [''],
				'@a': ['aaa', 'aa'],
				'@b': ['bbb', 'bb']
			});
		});

		it('partitions tags with multiple lines per entry', function () {
			expect(partition('@a aaa\naa\n@b bbb\nbb'))
			.toEqual({
				description: [''],
				'@a': ['aaa\naa'],
				'@b': ['bbb\nbb']
			});
		});

		it('partitions bare tags', function () {
			expect(partition('@a\naa\n@b\nbb'))
			.toEqual({
				description: [''],
				'@a': ['aa'],
				'@b': ['bb']
			});
		});
	});

	describe('extractType', function () {
		var extract =  dogma._extractType;

		it('extracts a simple type', function () {
			expect(extract('{number} name description'))
			.toEqual({ type: 'number', end: '{number}'.length });
		});

		it('extracts a complex type', function () {
			expect(extract('{{ a: number }} name description'))
			.toEqual({ type: '{ a: number }', end: '{{ a: number }}'.length });
		});
	});

	describe('extractName', function () {
		var extract = function (string) {
			return dogma._extractName(string, '{number}'.length);
		};

		it('extracts a simple name', function () {
			expect(extract('{number} name description'))
			.toEqual({ name: 'name', end: '{number} name '.length, optional: false, default_: undefined });
		});

		it('extracts an optional name', function () {
			expect(extract('{number} [name] description'))
			.toEqual({ name: 'name', end: '{number} [name] '.length, optional: true, default_: undefined });
		});

		it('extracts an optional name with a default value', function () {
			expect(extract('{number} [name=123] description'))
			.toEqual({ name: 'name', end: '{number} [name=123] '.length, optional: true, default_: '123' });
		});

		it('extracts an optional name with a default value that contains []', function () {
			expect(extract('{number} [name=[1, 2, 3]] description'))
			.toEqual({ name: 'name', end: '{number} [name=[1, 2, 3]] '.length, optional: true, default_: '[1, 2, 3]' });
		});
	});

	describe('extractTagReturn', function () {
		var extract = dogma._extractTagReturn;

		it('extracts the type and description from an @returns', function () {
			expect(extract('{type} Description goes here'))
			.toEqual({ type: 'type', description: 'Description goes here' });
		});

		it('extracts the type from an @returns', function () {
			expect(extract('{type}'))
			.toEqual({ type: 'type', description: '' });
		});

		it('extracts the description from an @returns', function () {
			expect(extract('Description goes here'))
			.toEqual({ type: '', description: 'Description goes here' });
		});
	});

	describe('extractTagTargetClass', function () {
		var extract = dogma._extractTagTargetClass;

		it('extracts the type, target and name of an @target-class', function () {
			expect(extract('class name method'))
			.toEqual({
				className: 'class',
				itemName: 'name',
				itemType: 'method'
			});
		});
	});

	describe('extract', function () {
		var extract = dogma.extract;

		it('extracts the description', function () {
			expect(extract('*\n* description'))
			.toEqual({ description: 'description' });
		});
	});
});
// jshint node:true
'use strict';

var typeParser = require('../../../src/type-expressions/type-parser');

describe('type-parser', function () {
	describe('parse', function () {
		var parse = typeParser.parse;

		describe('simple types', function () {
			it('parses a primitive type', function () {
				expect(parse('number')).toEqual({
					nodeType: 'primitive',
					name: {
						type: 'identifier',
						data: 'number'
					}
				});
			});

			it('parses the any type', function () {
				expect(parse('*')).toEqual({
					nodeType: 'any'
				});
			});
		});

		describe('functions', function () {
			it('parses a function with no parameters', function () {
				expect(parse('function ()')).toEqual({
					nodeType: 'function',
					parameters: []
				});
			});

			it('parses a function with one typed parameter', function () {
				expect(parse('function (a: boolean)')).toEqual({
					nodeType: 'function',
					parameters: [{
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'a'
						},
						type: {
							nodeType: 'primitive',
							name: {
								type: 'identifier',
								data: 'boolean'
							}
						}
					}]
				});
			});

			it('parses a function with one untyped parameter', function () {
				expect(parse('function (a)')).toEqual({
					nodeType: 'function',
					parameters: [{
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'a'
						}
					}]
				});
			});

			it('parses a function with two typed parameters', function () {
				expect(parse('function (a: boolean, b: string)')).toEqual({
					nodeType: 'function',
					parameters: [{
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'a'
						},
						type: {
							nodeType: 'primitive',
							name: {
								type: 'identifier',
								data: 'boolean'
							}
						}
					}, {
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'b'
						},
						type: {
							nodeType: 'primitive',
							name: {
								type: 'identifier',
								data: 'string'
							}
						}
					}]
				});
			});

			it('parses a function with a return type', function () {
				expect(parse('function (a: boolean) : string')).toEqual({
					nodeType: 'function',
					parameters: [{
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'a'
						},
						type: {
							nodeType: 'primitive',
							name: {
								type: 'identifier',
								data: 'boolean'
							}
						}
					}],
					return: {
						nodeType: 'primitive',
						name: {
							type: 'identifier',
							data: 'string'
						}
					}
				});
			});
		});

		describe('objects', function () {
			it('parses an object with no members', function () {
				expect(parse('{}')).toEqual({
					nodeType: 'object',
					members: []
				});
			});

			it('parses an object with one typed member', function () {
				expect(parse('{ a: boolean }')).toEqual({
					nodeType: 'object',
					members: [{
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'a'
						},
						type: {
							nodeType: 'primitive',
							name: {
								type: 'identifier',
								data: 'boolean'
							}
						}
					}]
				});
			});

			it('parses an object with one untyped member', function () {
				expect(parse('{ a }')).toEqual({
					nodeType: 'object',
					members: [{
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'a'
						}
					}]
				});
			});

			it('parses an object with two typed members', function () {
				expect(parse('{ a: boolean, b: string }')).toEqual({
					nodeType: 'object',
					members: [{
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'a'
						},
						type: {
							nodeType: 'primitive',
							name: {
								type: 'identifier',
								data: 'boolean'
							}
						}
					}, {
						nodeType: 'list-item',
						name: {
							type: 'identifier',
							data: 'b'
						},
						type: {
							nodeType: 'primitive',
							name: {
								type: 'identifier',
								data: 'string'
							}
						}
					}]
				});
			});
		});

		describe('classes', function () {
			it('parses a class with no parameters', function () {
				expect(parse('Promise')).toEqual({
					nodeType: 'class',
					name: {
						type: 'identifier',
						data: 'Promise'
					},
					parameters: []
				});
			});

			it('parses a class with one parameter', function () {
				expect(parse('Array<number>')).toEqual({
					nodeType: 'class',
					name: {
						type: 'identifier',
						data: 'Array'
					},
					parameters: [{
						nodeType: 'primitive',
						name: {
							type: 'identifier',
							data: 'number'
						}
					}]
				});
			});

			it('parses a class with two parameters', function () {
				expect(parse('Map<number, string>')).toEqual({
					nodeType: 'class',
					name: {
						type: 'identifier',
						data: 'Map'
					},
					parameters: [{
						nodeType: 'primitive',
						name: {
							type: 'identifier',
							data: 'number'
						}
					}, {
						nodeType: 'primitive',
						name: {
							type: 'identifier',
							data: 'string'
						}
					}]
				});
			});

			it('parses a class with one * parameter', function () {
				expect(parse('Map<number, *>')).toEqual({
					nodeType: 'class',
					name: {
						type: 'identifier',
						data: 'Map'
					},
					parameters: [{
						nodeType: 'primitive',
						name: {
							type: 'identifier',
							data: 'number'
						}
					}, {
						nodeType: 'any'
					}]
				});
			});
		});

		describe('either', function () {
			it('parses multiple choices', function () {
				expect(parse('(number|string|boolean)')).toEqual({
					nodeType: 'either',
					choices: [{
						nodeType: 'primitive',
						name: {
							type: 'identifier',
							data: 'number'
						}
					}, {
						nodeType: 'primitive',
						name: {
							type: 'identifier',
							data: 'string'
						}
					}, {
						nodeType: 'primitive',
						name: {
							type: 'identifier',
							data: 'boolean'
						}
					}]
				});
			});
		});
	});
});
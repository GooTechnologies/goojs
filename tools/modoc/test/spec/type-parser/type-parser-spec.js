// jshint node:true
'use strict';

var typeParser = require('../../../src/type-parser/type-parser');

describe('type-parser', function () {
	describe('destringify', function () {
		var destringify = typeParser.destringify;

		describe('simple types', function () {
			it('parses a primitive type', function () {
				expect(destringify('number')).toEqual({
					nodeType: 'primitive',
					name: {
						type: 'identifier',
						data: 'number'
					}
				});
			});

			it('parses the any type', function () {
				expect(destringify('*')).toEqual({
					nodeType: 'any'
				});
			});
		});

		describe('functions', function () {
			it('parses a function with no parameters', function () {
				expect(destringify('function ()')).toEqual({
					nodeType: 'function',
					parameters: []
				});
			});

			it('parses a function with one typed parameter', function () {
				expect(destringify('function (a: boolean)')).toEqual({
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
				expect(destringify('function (a)')).toEqual({
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
				expect(destringify('function (a: boolean, b: string)')).toEqual({
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
				expect(destringify('function (a: boolean) : string')).toEqual({
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
				expect(destringify('{}')).toEqual({
					nodeType: 'object',
					members: []
				});
			});

			it('parses an object with one typed member', function () {
				expect(destringify('{ a: boolean }')).toEqual({
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
				expect(destringify('{ a }')).toEqual({
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
				expect(destringify('{ a: boolean, b: string }')).toEqual({
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
				expect(destringify('Promise')).toEqual({
					nodeType: 'class',
					name: {
						type: 'identifier',
						data: 'Promise'
					},
					parameters: []
				});
			});

			it('parses a class with one parameter', function () {
				expect(destringify('Array<number>')).toEqual({
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
				expect(destringify('Map<number, string>')).toEqual({
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
		});
	});
});
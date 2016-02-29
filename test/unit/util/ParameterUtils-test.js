define([
	'goo/util/ParameterUtils'
], function (
	ParameterUtils
) {
	'use strict';

	describe('ParameterUtils', function () {
		it('defaults missing keys', function () {
			var parametersDefinition = [{
				key: 'a',
				type: 'int',
				'default': 123
			}, {
				key: 'b',
				type: 'string',
				'default': 'asd'
			}];

			var parametersValues = {};

			ParameterUtils.fillDefaultValues(parametersValues, parametersDefinition);

			var expected = {
				'a': 123,
				'b': 'asd'
			};

			expect(parametersValues).toEqual(expected);
		});

		it('defaults the defaults for all types', function () {
			var parametersDefinition = [{
				key: 'a',
				type: 'int'
			}, {
				key: 'b',
				type: 'float'
			}, {
				key: 'c',
				type: 'string'
			}, {
				key: 'd',
				type: 'vec3'
			}, {
				key: 'e',
				type: 'boolean'
			}, {
				key: 'f',
				type: 'texture'
			}, {
				key: 'g',
				type: 'entity'
			}];

			var parametersValues = {};

			ParameterUtils.fillDefaultValues(parametersValues, parametersDefinition);

			var expected = {
				'a': 0,
				'b': 0,
				'c': '',
				'd': [0, 0, 0],
				'e': false,
				'f': null,
				'g': null
			};

			expect(parametersValues).toEqual(expected);
		});
	});
});
define([
	'goo/scriptpack/ScriptHandler'
], function (
	ScriptHandler
) {
	'use strict';

	describe('ScriptHandler', function () {
		describe('validateParameter', function () {
			var validateParameter = ScriptHandler.validateParameter;

			it('validates a minimal parameter (key, type only)', function () {
				expect(validateParameter({
					key: 'asd',
					type: 'float'
				})).toBeUndefined();
			});

			it('validates a parameter with more properties', function () {
				expect(validateParameter({
					key: 'asd',
					name: 'blaha',
					type: 'float',
					min: 10,
					max: 20,
					exponential: true
				})).toBeUndefined();
			});

			it('returns an error object if the key is missing or is a non-string', function () {
				expect(validateParameter({
					type: 'float'
				})).toEqual({ message: 'Property "key" must be of type string' });

				expect(validateParameter({
					key: 123,
					type: 'float'
				})).toEqual({ message: 'Property "key" must be of type string' });
			});

			it('returns an error object if the key is an empty string', function () {
				expect(validateParameter({
					key: '',
					type: 'float'
				})).toEqual({ message: 'Property "key" must be longer than 0' });
			});

			it('returns an error object if the type is missing or bad', function () {
				expect(validateParameter({
					key: 'asd'
				})).toEqual({ message: 'Property "type" must be one of: string, int, float, vec2, vec3, vec4, boolean, texture, sound, camera, entity, animation' });

				expect(validateParameter({
					key: 'asd',
					type: 'unicorn'
				})).toEqual({ message: 'Property "type" must be one of: string, int, float, vec2, vec3, vec4, boolean, texture, sound, camera, entity, animation' });
			});
		});
	});
});

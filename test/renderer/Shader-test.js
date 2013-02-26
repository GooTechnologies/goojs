define([
	'goo/renderer/Shader'
], function(
	Shader
) {
	'use strict';

	describe('Shader', function() {
		describe('investigateShader', function() {
			var target;
			beforeEach(function() {
				target = {
					attributeMapping: {},
					uniformMapping: {},
					textureSlots: []
				};
			});
			it('can parse a uniform declaration', function() {
				var source = 'uniform vec3 foo;'
				Shader.investigateShader(source, target);
				expect(target.uniformMapping).toEqual({
					foo: {
						format: 'vec3'
					}
				});
			});
			it('can parse an attribute declaration', function() {
				var source = 'attribute float foo;'
				Shader.investigateShader(source, target);
				expect(target.attributeMapping).toEqual({
					foo: {
						format: 'float'
					}
				});
			});
			it('can parse a texture sampler', function() {
				var source = 'uniform sampler2D tex;';
				Shader.investigateShader(source, target);
				expect(target.uniformMapping).toEqual({
					tex: {
						format: 'sampler2D'
					}
				});
				expect(target.textureSlots).toEqual([
					{
						format: 'sampler2D',
						name: 'tex'
					}
				]);
			});
		});
	});
});

define([
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/renderer/RendererRecord',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/light/DirectionalLight',
	'goo/shapes/Box'
], function(
	Shader,
	Material,
	Camera,
	RendererRecord,
	ShaderLib,
	DirectionalLight,
	Box
) {
	'use strict';

	describe('Shader', function() {
		describe('Build and compile shader', function() {
			var shaderInfo;
			var renderer;
			beforeEach(function() {
				var material = new Material('test', ShaderLib.simpleLit);
				shaderInfo = {
					meshData: new Box(),
					material: material,
					lights: [new DirectionalLight()],
					camera: new Camera()
				};
				renderer = {
					context: {
						createShader: function(type) { return {}; },
						shaderSource: function(shader, source) {},
						compileShader: function(shader) {},
						getShaderParameter: function(shader, parameter) { return true; },
						getProgramParameter: function(shader, parameter) { return true; },
						getShaderInfoLog: function(shader) { return ''; },
						getProgramInfoLog: function(shader) { return ''; },
						createProgram: function(shader) { return {}; },
						getError: function() { return 0; },
						attachShader: function(program, source) {},
						linkProgram: function(program) {},
						useProgram: function(program) {},

						getAttribLocation: function(program, key) { return {}; },
						getUniformLocation: function(program, key) { return {}; },

						uniform1i: function(location, v0) {},
						uniform1f: function(location, v0) {},
						uniform3f: function(location, v0, v1, v2) {},
						uniform2fv: function(location, values) {},
						uniform3fv: function(location, values) {},
						uniform4fv: function(location, values) {},
						uniformMatrix4fv: function(location, transpose, data) {},
					},
					bindVertexAttribute: function(attributeIndex, attribute) {},
					rendererRecord: new RendererRecord()
				};
			});
			it('has applied the correct mappings', function() {
				var shader = shaderInfo.material.shader;

				shader.updateProcessors(shaderInfo);
				if (shader.builder) {
					shader.builder(shader, shaderInfo);
				}
				shader.apply(shaderInfo, renderer);


				console.log(shader);
			});
		});
		describe('investigateShader', function() {
			var target;
			beforeEach(function() {
				target = {
					uniforms: {},
					attributeMapping: {},
					uniformMapping: {},
					textureSlots: [],
					textureSlotsNaming: {}
				};
			});
			it('can parse a uniform declaration', function() {
				var source = 'uniform vec3 foo;';
				Shader.investigateShader(source, target);
				expect(target.uniformMapping).toEqual({
					foo: {
						format: 'vec3'
					}
				});
			});
			it('can parse an attribute declaration', function() {
				var source = 'attribute float foo;';
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
						name: 'tex',
						mapping : undefined,
						index : 0
					}
				]);
			});
		});
	});
});

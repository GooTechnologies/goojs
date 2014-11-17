define([
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/renderer/RendererRecord',
	'goo/renderer/Texture',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/light/DirectionalLight',
	'goo/shapes/Box'
], function(
	Shader,
	Material,
	Camera,
	RendererRecord,
	Texture,
	ShaderLib,
	DirectionalLight,
	Box
) {
	'use strict';

	describe('Shader', function() {
		describe('Build and compile shader', function() {
			var renderer;
			beforeEach(function() {
				/* jshint unused:false */
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
			var createShaderInfo = function (shaderDefinition) {
				var material = new Material('test', shaderDefinition);
				material.setTexture(Shader.DIFFUSE_MAP, new Texture());
				return {
					meshData: new Box(),
					material: material,
					lights: [new DirectionalLight()],
					camera: new Camera()
				};
			};
			var updateShader = function (shaderInfo) {
				var shader = shaderInfo.material.shader;
				shader.updateProcessors(shaderInfo);
				if (shader.builder) {
					shader.builder(shader, shaderInfo);
				}
				shader.apply(shaderInfo, renderer);
			};

			it('has applied the correct mappings to simple shader (simple)', function() {
				var shaderDefinition = ShaderLib.simple;
				var shaderInfo = createShaderInfo(shaderDefinition);
				updateShader(shaderInfo);

				var shader = shaderInfo.material.shader;
				console.log(shader);
				console.log(shaderInfo);

				expect(shader.attributes).toEqual(shaderDefinition.attributes);
				expect(shader.matchedUniforms).toEqual(Object.keys(shaderDefinition.uniforms));
				expect(shader.textureSlots.length).toEqual(0);

				// add a uniform that does not exist in shader
				shader.uniforms.doesnotexist = 1;
				updateShader(shaderInfo);
				console.log(shader);
			});
			it('has applied the correct mappings to complex shader (uber)', function() {
				var shaderDefinition = ShaderLib.uber;
				var shaderInfo = createShaderInfo(shaderDefinition);
				updateShader(shaderInfo);

				var shader = shaderInfo.material.shader;
				console.log(shader);
				console.log(shaderInfo);
				console.log(shader.matchedUniforms);
				console.log(Object.keys(shaderDefinition.uniforms));

				expect(shader.attributes).toEqual(shaderDefinition.attributes);
				// expect(shader.matchedUniforms).toEqual(Object.keys(shaderDefinition.uniforms));
				expect(shader.textureSlots.length).toEqual(1);
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

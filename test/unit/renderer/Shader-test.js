define([
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/renderer/MeshData',
	'goo/renderer/Camera',
	'goo/renderer/RendererRecord',
	'goo/renderer/Texture',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/light/DirectionalLight',
	'goo/shapes/Box'
], function(
	Shader,
	Material,
	MeshData,
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
			var createRenderer = function (shaderDefinition) {
				/* jshint unused:false */
				return {
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
			};
			var createShaderInfo = function (shaderDefinition) {
				var material = new Material('test', shaderDefinition);
				material.setTexture(Shader.DIFFUSE_MAP, new Texture());
				var renderer = createRenderer(shaderDefinition);
				return {
					meshData: new Box(),
					material: material,
					lights: [new DirectionalLight()],
					camera: new Camera(),
					renderer: renderer
				};
			};
			var updateShader = function (shaderInfo) {
				var shader = shaderInfo.material.shader;
				shader.updateProcessors(shaderInfo);
				if (shader.builder) {
					shader.builder(shader, shaderInfo);
				}
				shader.apply(shaderInfo, shaderInfo.renderer);
			};

			it('has applied the correct mappings to simple shader (simple)', function() {
				var shaderDefinition = miniShaderDefinition;
				var shaderInfo = createShaderInfo(shaderDefinition);
				updateShader(shaderInfo);

				spyOn(shaderInfo.renderer.context, 'uniform1i').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniform1f').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniformMatrix4fv').and.callThrough();

				var shader = shaderInfo.material.shader;

				expect(shader.attributes).toEqual(shaderDefinition.attributes);

				// all matched uniforms should equal the shader definition uniforms
				expect(shader.matchedUniforms).toEqual(Object.keys(shaderDefinition.uniforms));

				// textures should be zero even though material has a texture since the shader does not
				expect(shader.textureSlots.length).toEqual(0);

				// add a uniform that does not exist in shader (and should not be matched)
				shader.uniforms.doesNotExist = 1;
				shader.rebuild();
				updateShader(shaderInfo);

				expect(shader.matchedUniforms).not.toContain('doesNotExist');

				// check that the ShaderCalls have been executed
				expect(shaderInfo.renderer.context.uniform1i.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniform1f.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(2);

				// add a uniform that does exist in shader (and should be matched)
				shader.uniforms.doesExist = 1;
				shader.rebuild();
				updateShader(shaderInfo);

				expect(shader.matchedUniforms).toContain('doesExist');

				// check that the ShaderCalls have been executed
				expect(shaderInfo.renderer.context.uniform1i.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniform1f.calls.count()).toEqual(1);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(4);

				// console.log(shaderInfo.renderer.context.uniformMatrix4fv.calls.count());
			});
			it('has applied the correct mappings to complex shader (uber)', function() {
				var shaderDefinition = miniShaderDefinition;
				var shaderInfo = createShaderInfo(shaderDefinition);
				updateShader(shaderInfo);

				spyOn(shaderInfo.renderer.context, 'uniform1i').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniform1f').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniformMatrix4fv').and.callThrough();

				var shader = shaderInfo.material.shader;

				expect(shader.attributes).toEqual(shaderDefinition.attributes);

				// all matched uniforms should equal the shader definition uniforms
				expect(shader.matchedUniforms).toEqual(Object.keys(shaderDefinition.uniforms));

				// textures should be zero even though material has a texture since the shader does not
				expect(shader.textureSlots.length).toEqual(0);

				// add a uniform that does not exist in shader (and should not be matched)
				shader.uniforms.doesNotExist = 1;
				shader.rebuild();
				updateShader(shaderInfo);

				expect(shader.matchedUniforms).not.toContain('doesNotExist');

				// check that the ShaderCalls have been executed
				expect(shaderInfo.renderer.context.uniform1i.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniform1f.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(2);

				// add a uniform that does exist in shader (and should be matched)
				shader.uniforms.doesExist = 1;
				shader.rebuild();
				updateShader(shaderInfo);

				expect(shader.matchedUniforms).toContain('doesExist');

				// check that the ShaderCalls have been executed
				expect(shaderInfo.renderer.context.uniform1i.calls.count()).toEqual(0);
				expect(shaderInfo.renderer.context.uniform1f.calls.count()).toEqual(1);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(4);

				// console.log(shaderInfo.renderer.context.uniformMatrix4fv.calls.count());
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

	var miniShaderDefinition = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX
		},
		vshader : [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'uniform float doesExist;',
		'varying float test;',

		'void main(void) {',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'varying float test;',
		'void main(void)',
		'{',
			'gl_FragColor = vec4(test);',
		'}'
		].join('\n')
	};
});

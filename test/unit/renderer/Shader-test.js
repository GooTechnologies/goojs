define([
	'goo/renderer/Shader',
	'goo/renderer/ShaderCall',
	'goo/renderer/Material',
	'goo/renderer/MeshData',
	'goo/renderer/Camera',
	'goo/renderer/RendererRecord',
	'goo/renderer/Texture',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/light/DirectionalLight',
	'goo/util/ObjectUtils',
	'goo/shapes/Box'
], function (
	Shader,
	ShaderCall,
	Material,
	MeshData,
	Camera,
	RendererRecord,
	Texture,
	ShaderLib,
	DirectionalLight,
	ObjectUtils,
	Box
) {
	'use strict';

	describe('Shader', function () {
		describe('DefineKey', function () {
			var shader;
			beforeEach(function () {
				shader = new Shader('TestName', ObjectUtils.clone(ShaderLib.simple));
			});

			it('can generate define key when no defines', function () {
				var defineIndices = [];
				var key = shader.getDefineKey(defineIndices);
				expect(key).toEqual('Key:TestName');
				expect(defineIndices).toEqual([]);
			});

			it('can generate define key with one define', function () {
				var defineIndices = [];

				shader.setDefine('TEST_DEFINE', true);

				var key = shader.getDefineKey(defineIndices);
				expect(key).toEqual('Key:TestName_0:true');
				expect(defineIndices).toEqual(['TEST_DEFINE']);
			});

			it('can generate define key with various define types (added)', function () {
				var defineIndices = [];

				shader.setDefine('TEST_DEFINE1', true);
				shader.setDefine('TEST_DEFINE2', 5);

				var key = shader.getDefineKey(defineIndices);
				expect(key).toEqual('Key:TestName_0:true_1:5');
				expect(defineIndices).toEqual(['TEST_DEFINE1', 'TEST_DEFINE2']);
			});

			it('can generate define key with various define types (added+removed)', function () {
				var defineIndices = [];

				shader.setDefine('TEST_DEFINE1', true);
				shader.setDefine('TEST_DEFINE2', 5);
				shader.removeDefine('TEST_DEFINE1');

				var key = shader.getDefineKey(defineIndices);
				expect(key).toEqual('Key:TestName_0:5');
				expect(defineIndices).toEqual(['TEST_DEFINE2']);
			});

			it('only re-generate key when dirty', function () {
				var defineIndices = [];

				shader.defineKey = 'unset';

				shader.setDefine('TEST_DEFINE1', true);

				var key = shader.getDefineKey(defineIndices);

				expect(key).toEqual('Key:TestName_0:true');

				shader.defineKey = 'unset';

				key = shader.getDefineKey(defineIndices);

				expect(key).toEqual('unset');
			});
		});

		describe('ShaderCall', function () {
			var context;

			beforeEach(function () {
				context = createContext();
			});

			var testSingleCall = function (shaderCall, method, value) {
				shaderCall.call(value);
				expect(method).toHaveBeenCalled();
				var args = method.calls.mostRecent().args;
				expect(args[args.length - 1]).toEqual(value);
			};

			var testShaderCall = function (context, method, type, value1, value2) {
				var shaderCall = new ShaderCall(context, {}, type);
				spyOn(context, method);

				// check that methods are correctly called for value1
				testSingleCall(shaderCall, context[method], value1);

				context[method].calls.reset();

				// check that no methods are called due to same value opt
				shaderCall.call(value1);
				expect(context[method]).not.toHaveBeenCalled();

				context[method].calls.reset();

				// check that methods are correctly called for value2
				testSingleCall(shaderCall, context[method], value2);
			};

			it('can optimize calls to ShaderCall uniforms', function () {
				testShaderCall(context, 'uniform1f', 'float', 2.3, 5.5);
				testShaderCall(context, 'uniform1i', 'int', 5, 8);

				// arrays
				testShaderCall(context, 'uniform1iv', 'intarray', [1, 2], [3, 4]);
				testShaderCall(context, 'uniform2iv', 'ivec2', [1, 2], [3, 4]);
				testShaderCall(context, 'uniform3iv', 'ivec3', [1, 2, 3], [3, 4, 5]);
				testShaderCall(context, 'uniform4iv', 'ivec4', [1, 2, 3, 4], [3, 4, 5, 6]);

				testShaderCall(context, 'uniform1fv', 'floatarray', [1.2, 2.3], [3.4, 4.5]);
				testShaderCall(context, 'uniform2fv', 'vec2', [1.2, 2.3], [3.4, 4.5]);
				testShaderCall(context, 'uniform3fv', 'vec3', [1.2, 2.3, 3.4], [3.4, 4.5, 5.6]);
				testShaderCall(context, 'uniform4fv', 'vec4', [1.2, 2.3, 3.4, 4.5], [3.4, 4.5, 5.6, 6.7]);

				testShaderCall(context, 'uniformMatrix2fv', 'mat2',
					[1.2, 2.3, 3.4, 4.5],
					[3.4, 4.5, 5.6, 6.7]
				);
				testShaderCall(context, 'uniformMatrix3fv', 'mat3',
					[1, 2, 3, 4, 5, 6, 7, 8, 9],
					[1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1]
				);
				testShaderCall(context, 'uniformMatrix4fv', 'mat4',
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
					[1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1, 16.1]
				);
			});
		});
		describe('Build and compile shader', function () {
			var createRenderer = function () {
				return {
					context: createContext(),
					bindVertexAttribute: function () {},
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

			it('has applied the correct mappings to simple shader (simple)', function () {
				var shaderDefinition = miniShaderDefinition;
				var shaderInfo = createShaderInfo(shaderDefinition);
				updateShader(shaderInfo);

				spyOn(shaderInfo.renderer.context, 'uniform1i').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniform1f').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniformMatrix4fv').and.callThrough();

				var shader = shaderInfo.material.shader;

				expect(shader.attributes).toEqual(shaderDefinition.attributes);

				// all matched uniforms should equal the shader definition uniforms
				expect(shader.matchedUniforms).toContain('viewProjectionMatrix');
				expect(shader.matchedUniforms).toContain('worldMatrix');

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
				expect(shaderInfo.renderer.context.uniform1f).toHaveBeenCalledWith({value:1}, 1);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(4);
			});

			it('has applied the correct mappings to complex shader (uber)', function () {
				var shaderDefinition = ShaderLib.uber;
				var shaderInfo = createShaderInfo(shaderDefinition);

				spyOn(shaderInfo.renderer.context, 'uniform1i').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniform1f').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniform4fv').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniformMatrix3fv').and.callThrough();
				spyOn(shaderInfo.renderer.context, 'uniformMatrix4fv').and.callThrough();

				updateShader(shaderInfo);
				var shader = shaderInfo.material.shader;

				expect(shader.attributes).toEqual(shaderDefinition.attributes);

				// all matched uniforms should equal the shader definition uniforms
				expect(shader.matchedUniforms).toContain('viewProjectionMatrix');
				expect(shader.matchedUniforms).toContain('worldMatrix');

				// 10 sample2d slots in uber shader
				expect(shader.textureSlots.length).toEqual(10);

				// check that the ShaderCalls have been executed
				expect(shaderInfo.renderer.context.uniform1i.calls.count()).toEqual(10);
				expect(shaderInfo.renderer.context.uniform1f.calls.count()).toEqual(9);
				expect(shaderInfo.renderer.context.uniform4fv.calls.count()).toEqual(2);
				expect(shaderInfo.renderer.context.uniformMatrix3fv.calls.count()).toEqual(1);
				expect(shaderInfo.renderer.context.uniformMatrix4fv.calls.count()).toEqual(2);
			});
		});

		describe('investigateShader', function () {
			var target;

			beforeEach(function () {
				target = {
					uniforms: {},
					attributeMapping: {},
					uniformMapping: {},
					textureSlots: [],
					textureSlotsNaming: {}
				};
			});

			it('can parse a uniform declaration', function () {
				var source = 'uniform vec3 foo;';
				Shader.investigateShader(source, target);
				expect(target.uniformMapping).toEqual({
					foo: {
						format: 'vec3'
					}
				});
			});

			it('can parse an attribute declaration', function () {
				var source = 'attribute float foo;';
				Shader.investigateShader(source, target);
				expect(target.attributeMapping).toEqual({
					foo: {
						format: 'float'
					}
				});
			});

			it('can parse a texture sampler', function () {
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

	var createContext = function () {
		/* jshint unused:false */
		return {
			createShader: function (type) { return {}; },
			shaderSource: function (shader, source) {},
			compileShader: function (shader) {},
			getShaderParameter: function (shader, parameter) { return true; },
			getProgramParameter: function (shader, parameter) { return true; },
			getShaderInfoLog: function (shader) { return ''; },
			getProgramInfoLog: function (shader) { return ''; },
			createProgram: function (shader) { return {}; },
			getError: function () { return 0; },
			attachShader: function (program, source) {},
			linkProgram: function (program) {},
			useProgram: function (program) {},

			getAttribLocation: function (program, key) { return {}; },
			getUniformLocation: function (program, key) { return {}; },

			uniform1f: function (location, v0) {},
			uniform1i: function (location, v0) {},
			uniform2f: function (location, v0, v1) {},
			uniform2i: function (location, v0, v1) {},
			uniform3f: function (location, v0, v1, v2) {},
			uniform3i: function (location, v0, v1, v2) {},
			uniform4f: function (location, v0, v1, v2, v3) {},
			uniform4i: function (location, v0, v1, v2, v3) {},

			uniform1iv: function (location, values) {},
			uniform2iv: function (location, values) {},
			uniform3iv: function (location, values) {},
			uniform4iv: function (location, values) {},

			uniform1fv: function (location, values) {},
			uniform2fv: function (location, values) {},
			uniform3fv: function (location, values) {},
			uniform4fv: function (location, values) {},

			uniformMatrix2fv: function (location, transpose, data) {},
			uniformMatrix3fv: function (location, transpose, data) {},
			uniformMatrix4fv: function (location, transpose, data) {},
		};
	};

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

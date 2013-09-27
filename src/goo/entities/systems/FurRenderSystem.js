define([
	'goo/entities/systems/System',
	'goo/entities/EventHandler',
	'goo/renderer/SimplePartitioner',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util',
	'goo/util/DebugDrawHelper',
	'goo/math/Transform',
	'goo/shapes/Grid',
	'goo/shapes/Quad'
],
	/** @lends */
		function (
		System,
		EventHandler,
		SimplePartitioner,
		MeshData,
		Material,
		Shader,
		ShaderLib,
		Util,
		DebugDrawHelper,
		Transform,
		Grid,
		Quad
		) {
		"use strict";


		function FurRenderSystem() {
			System.call(this, 'FurRenderSystem', []);

			this.renderList = [];
			this.doRender = {
				grid: true,
				surface: true
			};

			this.camera = null;
			this.lights = [];
			this.transform = new Transform();
			this.transform.rotation.rotateX(-Math.PI / 2);
			this.transform.scale.setd(10000, 10000, 10000);
			this.transform.update();

			var gridMaterial = Material.createMaterial(gridShaderDef, 'Grid Material');
			gridMaterial.depthState.write = true;
			gridMaterial.depthState.enabled = true;

			this.grid = {
				meshData: new Grid(100, 100),
				materials: [gridMaterial],
				transform: this.transform
			};
			var surfaceShader = Util.clone(ShaderLib.simpleLit);
			surfaceShader.uniforms.opacity = 1.0;
			var fshader = surfaceShader.fshader.split('\n');
			fshader.unshift('uniform float opacity;');
			fshader.splice(fshader.length - 2, 0, 'final_color.a = opacity;');
			surfaceShader.fshader = fshader.join('\n');

			var surfaceMaterial = Material.createMaterial(surfaceShader, 'Surface Material');
			surfaceMaterial.uniforms.materialAmbient = [0.4, 0.4, 0.4, 1.0];
			surfaceMaterial.uniforms.materialDiffuse = [0.6, 0.6, 0.6, 1.0];
			surfaceMaterial.uniforms.materialSpecular = [0.6, 0.6, 0.6, 1.0];
			surfaceMaterial.uniforms.opacity = 0.9;
			surfaceMaterial.blendState.blending = 'CustomBlending';
			surfaceMaterial.cullState.enabled = false;
			surfaceMaterial.depthState.write = true;
			surfaceMaterial.depthState.enabled = true;
			surfaceMaterial.offsetState.enabled = true;
			surfaceMaterial.offsetState.units = 10;
			surfaceMaterial.offsetState.factor = 0.8;

			this.surface = {
				meshData: new Quad(),
				materials: [surfaceMaterial],
				transform: this.transform
			};

			var that = this;
			EventHandler.addListener({
				setCurrentCamera : function (camera) {
					that.camera = camera;
				},
				setLights : function (lights) {
					that.lights = lights;
				}
			});
		}

		GridRenderSystem.prototype = Object.create(System.prototype);

		GridRenderSystem.prototype.inserted = function (/*entity*/) {
		};

		GridRenderSystem.prototype.deleted = function (/*entity*/) {
		};

		GridRenderSystem.prototype.process = function (/*entities, tpf*/) {
			var count = this.renderList.length = 0;
			if (this.doRender.surface) {
				this.renderList[count++] = this.surface;
			}
			if (this.doRender.grid) {
				this.renderList[count++] = this.grid;
			}
			this.renderList.length = count;
		};

		GridRenderSystem.prototype.render = function (renderer/*, picking*/) {
			renderer.checkResize(this.camera);

			if (this.camera) {
				renderer.render(this.renderList, this.camera, this.lights, null, { color: false, depth: false, stencil: false });
			}
		};

		var gridShaderDef = {
			attributes : {
				vertexPosition : MeshData.POSITION
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				color: [0.5, 0.5, 0.5, 1],
				fogOn: false,
				fogColor: [0.1, 0.1, 0.1, 1],
				fogNear: Shader.NEAR_PLANE,
				fogFar: Shader.FAR_PLANE
			},
			vshader : [ //
							 'attribute vec3 vertexPosition;',

							 'uniform mat4 worldMatrix;',
							 'uniform mat4 viewMatrix;',
							 'uniform mat4 projectionMatrix;',

							 'varying float depth;',

							 'void main(void)',
							 '{',
							 'vec4 viewPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',

							 'depth = viewPosition.z;',

							 'gl_Position = projectionMatrix * viewPosition;',
							 '}'
						 ].join('\n'),
			fshader : [//
							 'precision mediump float;',

							 'uniform vec4 fogColor;',
							 'uniform vec4 color;',
							 'uniform float fogNear;',
							 'uniform float fogFar;',
							 'uniform bool fogOn;',

							 'varying float depth;',

							 'void main(void)',
							 '{',
							 'if (fogOn) {',
							 'float lerpVal = clamp(depth / (-fogFar + fogNear), 0.0, 1.0);',
							 'lerpVal = pow(lerpVal, 1.5);',
							 'gl_FragColor = mix(color, fogColor, lerpVal);',
							 '} else {',
							 'gl_FragColor = color;',
							 '}',
							 '}'
						 ].join('\n')
		};

		return FurRenderSystem;
	});
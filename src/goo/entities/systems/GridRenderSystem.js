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

	/**
	 * @class Renders entities/renderables using a configurable partitioner for culling
	 * @property {Boolean} doRender Only render if set to true
	 */
	function GridRenderSystem() {
		/*
		null means that it listens to all entities which is not true - this system si not interested in any entity at all,
		so then why have it as a system and not as a callback?
		 */
		System.call(this, 'GridRenderSystem', null);

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

		this.grid = {
			meshData: new Grid(100, 100),
			materials: [Material.createMaterial(gridShaderDef, 'Grid Material')],
			transform: this.transform
		};
		var surfaceMaterial = Material.createMaterial(ShaderLib.simpleLit, 'Surface Material');
		surfaceMaterial.uniforms.materialDiffuse = [0.6, 0.6, 0.6, 1.0];
		surfaceMaterial.uniforms.materialSpecular = [0.6, 0.6, 0.6, 1.0];
		surfaceMaterial.cullState.enabled = false;
		surfaceMaterial.depthState.write = false;
		surfaceMaterial.depthState.enabled = false;

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
			renderer.render(this.renderList, this.camera, this.lights, null, { color: false, depth: true, stencil: true });
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

	return GridRenderSystem;
});
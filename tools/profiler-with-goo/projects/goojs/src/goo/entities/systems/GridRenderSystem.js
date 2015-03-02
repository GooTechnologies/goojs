define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/renderer/SimplePartitioner',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util',
	'goo/math/Transform',
	'goo/shapes/Grid',
	'goo/shapes/Quad'
],
/** @lends */
function (
	System,
	SystemBus,
	SimplePartitioner,
	MeshData,
	Material,
	Shader,
	ShaderLib,
	Util,
	Transform,
	Grid,
	Quad
) {
	'use strict';

	/**
	 * @class Renders entities/renderables using a configurable partitioner for culling
	 * @property {Boolean} doRender Only render if set to true
	 * @extends System
	 */
	function GridRenderSystem() {
		System.call(this, 'GridRenderSystem', []);

		this.renderList = [];
		this.doRender = {
			grid: true,
			surface: true
		};

		this.camera = null;
		this.lights = [];
		this.transform = new Transform();
		this.transform.rotation.rotateX(-Math.PI / 2);
		this.transform.scale.setd(1000, 1000, 1000);
		this.transform.update();

		var gridMaterial = new Material(gridShaderDef, 'Grid Material');
		gridMaterial.depthState.write = true;
		gridMaterial.depthState.enabled = true;

		this.grid = {
			meshData: new Grid(100, 100),
			materials: [gridMaterial],
			transform: this.transform
		};
		// It ain't pretty, but it works
		var surfaceShader = Util.clone(ShaderLib.simpleColored);
		var surfaceMaterial = new Material(surfaceShader, 'Surface Material');
		surfaceMaterial.uniforms.color = [0.4, 0.4, 0.4];
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

		// stop using this pattern - use instead .bind()
		var that = this;
		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			that.camera = newCam.camera;
		});

		SystemBus.addListener('goo.setLights', function (lights) {
			that.lights = lights;
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
			renderer.render(this.renderList, this.camera, this.lights, null, false);
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
			color: [0.55, 0.55, 0.55, 1],
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
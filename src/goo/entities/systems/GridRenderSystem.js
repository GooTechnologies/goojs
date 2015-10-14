define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/renderer/SimplePartitioner',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/ObjectUtils',
	'goo/math/Transform',
	'goo/math/MathUtils',
	'goo/shapes/Grid',
	'goo/shapes/Quad'
], function (
	System,
	SystemBus,
	SimplePartitioner,
	MeshData,
	Material,
	Shader,
	ShaderLib,
	ObjectUtils,
	Transform,
	MathUtils,
	Grid,
	Quad
) {
	'use strict';

	/**
	 * Renders entities/renderables using a configurable partitioner for culling
	 * @property {boolean} doRender Only render if set to true
	 * @extends System
	 */
	function GridRenderSystem() {
		System.call(this, 'GridRenderSystem', []);

		this.renderList = [];
		this.doRender = {
			grid: true,
			surface: true
		};

		this.scale = 2; //1000
		this.count = 10; //100

		this.camera = null;
		this.lights = [];
		this.transform1 = new Transform();
		this.transform1.rotation.rotateX(-Math.PI / 2);
		this.transform1.scale.setDirect(this.scale, this.scale, this.scale);
		this.transform1.update();

		this.transform2 = new Transform();
		this.transform2.rotation.rotateX(-Math.PI / 2);
		this.transform2.scale.setDirect(this.scale, this.scale, this.scale);
		this.transform2.update();

		var gridMaterial1 = new Material(gridShaderDef, 'Grid Material');
		gridMaterial1.blendState.blending = 'TransparencyBlending';
		gridMaterial1.uniforms.color = [0, 1, 0, 1];
		gridMaterial1.depthState.write = true;
		gridMaterial1.depthState.enabled = true;
		var gridMaterial2 = new Material(gridShaderDef, 'Grid Material');
		gridMaterial2.blendState.blending = 'TransparencyBlending';
		gridMaterial2.uniforms.color = [1, 0, 0, 1];
		gridMaterial2.depthState.write = true;
		gridMaterial2.depthState.enabled = true;

		var gridMesh = new Grid(this.count, this.count);
		this.grid1 = {
			meshData: gridMesh,
			materials: [gridMaterial1],
			transform: this.transform1
		};
		this.grid2 = {
			meshData: gridMesh,
			materials: [gridMaterial2],
			transform: this.transform2
		};


		// It ain't pretty, but it works
		var surfaceShader = ObjectUtils.deepClone(ShaderLib.simpleColored);
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

		this.oldHeightScale = 0;
		this.oldX = 0;
		this.oldZ = 0;

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
	GridRenderSystem.prototype.constructor = GridRenderSystem;

	GridRenderSystem.prototype.inserted = function (/*entity*/) {};

	GridRenderSystem.prototype.deleted = function (/*entity*/) {};

	GridRenderSystem.prototype.process = function (/*entities, tpf*/) {
		var count = this.renderList.length = 0;
		// if (this.doRender.surface) {
		// 	this.renderList[count++] = this.surface;
		// }
		if (this.doRender.grid) {
			this.renderList[count++] = this.grid1;
			this.renderList[count++] = this.grid2;
		}
		this.renderList.length = count;

		var y = this.camera.translation.y;
		var heightScale = Math.pow(2, Math.floor(Math.pow(y, 0.5) / 2)) * this.scale;
		var blender = y / 10 - Math.floor(y / 10);
		// blender = Math.abs(blender - 0.5) * 2;

		// var fader = MathUtils.moduloPositive(blender + 0.5, 1);
		var fader = Math.abs(blender*2 - 1) * 1;
		this.grid1.materials[0].uniforms.opacity = fader;
		// this.grid2.materials[0].uniforms.opacity = 1 - fader;
		this.grid2.materials[0].uniforms.opacity = 0;


		blender = Math.abs(blender - 0.5) * 2;
		var mult1 = 1 + Math.round(blender);
		var mult2 = 1 + Math.round(1 - blender);


		var x = Math.floor(this.camera.translation.x * this.count / heightScale);
		var z = Math.floor(this.camera.translation.z * this.count / heightScale);
		if (heightScale !== this.oldHeightScale || x !== this.oldX || z !== this.oldZ) {
			this.transform1.scale.setDirect(heightScale * mult1, heightScale * mult1, heightScale * mult1);
			this.transform1.translation.x = x * heightScale * mult1 / this.count;
			this.transform1.translation.z = z * heightScale * mult1 / this.count;
			this.transform1.update();

			this.transform2.scale.setDirect(heightScale * mult2, heightScale * mult2, heightScale * mult2);
			this.transform2.translation.x = x * heightScale * mult2 / this.count;
			this.transform2.translation.z = z * heightScale * mult2 / this.count;
			this.transform2.update();

			this.oldX = x;
			this.oldZ = z;
			this.oldHeightScale = heightScale;

			// console.log(x, z);
		}
	};

	GridRenderSystem.prototype.render = function (renderer/*, picking*/) {
		renderer.checkResize(this.camera);

		if (this.camera) {
			renderer.render(this.renderList, this.camera, this.lights, null, false);
		}
	};

	GridRenderSystem.prototype.invalidateHandles = function (renderer) {
		this.renderList.forEach(function (renderable) {
			renderable.materials.forEach(function (material) {
				renderer.invalidateMaterial(material);
			});
			renderer.invalidateMeshData(renderable.meshData);
		});
	};

	var gridShaderDef = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			color: [0.55, 0.55, 0.55, 1],
			fogOn: false,
			fogColor: [0.1, 0.1, 0.1, 1],
			fogNear: Shader.NEAR_PLANE,
			fogFar: Shader.FAR_PLANE,
			opacity: 1
		},
		vshader: [
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
		fshader: [
			'precision mediump float;',

			'uniform vec4 fogColor;',
			'uniform vec4 color;',
			'uniform float fogNear;',
			'uniform float fogFar;',
			'uniform bool fogOn;',
			'uniform float opacity;',

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
				'gl_FragColor.a = opacity;',
			'}'
		].join('\n')
	};

	return GridRenderSystem;
});
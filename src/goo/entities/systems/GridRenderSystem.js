import System from '../../entities/systems/System';
import SystemBus from '../../entities/SystemBus';
import SimplePartitioner from '../../renderer/SimplePartitioner';
import MeshData from '../../renderer/MeshData';
import Material from '../../renderer/Material';
import Shader from '../../renderer/Shader';
import ShaderLib from '../../renderer/shaders/ShaderLib';
import ObjectUtils from '../../util/ObjectUtils';
import Transform from '../../math/Transform';
import MathUtils from '../../math/MathUtils';
import Grid from '../../shapes/Grid';



	/**
	 * Renders entities/renderables using a configurable partitioner for culling
	 * @property {boolean} doRender Only render if set to true
	 * @extends System
	 */
	function GridRenderSystem() {
		System.call(this, 'GridRenderSystem', []);

		this.renderList = [];
		this.doRender = {
			grid: true
		};

		this.scale = 62.5;
		this.count = 100;

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

		var col = 0.2;
		var gridMaterial1 = new Material(gridShaderDef, 'Grid Material');
		gridMaterial1.blendState.blending = 'TransparencyBlending';
		gridMaterial1.uniforms.color = [col, col, col, 1];
		gridMaterial1.depthState.write = false;
		gridMaterial1.depthState.enabled = true;
		var gridMaterial2 = new Material(gridShaderDef, 'Grid Material');
		gridMaterial2.blendState.blending = 'TransparencyBlending';
		gridMaterial2.uniforms.color = [col, col, col, 1];
		gridMaterial2.depthState.write = false;
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

		this.oldHeightScale1 = 0;
		this.oldX1 = 0;
		this.oldZ1 = 0;
		this.oldHeightScale1 = 0;
		this.oldX1 = 0;
		this.oldZ1 = 0;

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

	function smoothstep(t, level) {
		for (var i = 0; i < level; ++i) {
			t = Math.pow(t, 2) * (3 - 2 * t);
		}
		return t;
	}

	GridRenderSystem.prototype.process = function (/*entities, tpf*/) {
		if (!this.doRender.grid) {
			return;
		}

		var y = Math.max(Math.abs(this.camera.translation.y) / 10, 0);

		var y1 = Math.pow(y, 0.15);
		var blender1 = 1 - Math.abs(y1 - Math.floor(y1) - 0.5) * 2;
		blender1 = Math.min(blender1 * 2, 1);
		var heightScale1 = Math.pow(2, Math.floor(y1) * 4 + 2) * this.scale;

		var y2 = Math.pow(y, 0.15) + 0.5;
		var blender2 = 1 - Math.abs(y2 - Math.floor(y2) - 0.5) * 2;
		blender2 = Math.min(blender2 * 2, 1);
		var heightScale2 = Math.pow(2, Math.floor(y2) * 4) * this.scale;

		blender1 = smoothstep(blender1, 1);
		blender2 = smoothstep(blender2, 1);

		this.grid1.materials[0].uniforms.scale = heightScale1;
		this.grid1.materials[0].uniforms.opacity = blender1;

		this.grid2.materials[0].uniforms.scale = heightScale2;
		this.grid2.materials[0].uniforms.opacity = blender2;

		var x = Math.floor(this.camera.translation.x * this.count / heightScale1);
		var z = Math.floor(this.camera.translation.z * this.count / heightScale1);
		if (heightScale1 !== this.oldHeightScale1 || x !== this.oldX1 || z !== this.oldZ1) {
			this.transform1.scale.setDirect(heightScale1, heightScale1, heightScale1);
			this.transform1.translation.x = x * heightScale1 / this.count;
			this.transform1.translation.z = z * heightScale1 / this.count;
			this.transform1.update();

			this.oldX1 = x;
			this.oldZ1 = z;
			this.oldHeightScale1 = heightScale1;
		}

		x = Math.floor(this.camera.translation.x * this.count / heightScale2);
		z = Math.floor(this.camera.translation.z * this.count / heightScale2);
		if (heightScale2 !== this.oldHeightScale2 || x !== this.oldX2 || z !== this.oldZ2) {
			this.transform2.scale.setDirect(heightScale2, heightScale2, heightScale2);
			this.transform2.translation.x = x * heightScale2 / this.count;
			this.transform2.translation.z = z * heightScale2 / this.count;
			this.transform2.update();

			this.oldX2 = x;
			this.oldZ2 = z;
			this.oldHeightScale2 = heightScale2;
		}

		if (blender1 > blender2) {
			this.renderList[0] = this.grid1;
			this.renderList[1] = this.grid2;
		} else {
			this.renderList[0] = this.grid2;
			this.renderList[1] = this.grid1;
		}
	};

	GridRenderSystem.prototype.render = function (renderer/*, picking*/) {
		renderer.checkResize(this.camera);

		if (this.camera && this.doRender.grid) {
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
			fogNear: Shader.NEAR_PLANE,
			fogFar: Shader.FAR_PLANE,
			opacity: 1,
			scale: 1
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 worldMatrix;',
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',

			'varying float depth;',

			'void main(void) {',
				'vec4 viewPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',

				'depth = -viewPosition.z;',

				'gl_Position = projectionMatrix * viewPosition;',
			'}'
		].join('\n'),
		fshader: [
			'precision mediump float;',

			'uniform vec4 color;',
			'uniform float fogNear;',
			'uniform float fogFar;',
			'uniform float opacity;',
			'uniform float scale;',

			'varying float depth;',

			'void main(void) {',
				'gl_FragColor = color;',
				'float lerpVal = 1.0 - clamp(depth * 3.0 / min(scale, fogFar * 3.0), 0.0, 1.0);',
				'gl_FragColor.a = opacity * lerpVal;',
			'}'
		].join('\n')
	};

	export default GridRenderSystem;
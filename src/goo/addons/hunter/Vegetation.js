define([
	'goo/entities/components/MeshDataComponent',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/math/MathUtils',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/renderer/TextureCreator',
	'goo/renderer/Texture',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/light/DirectionalLight',
	'goo/util/CanvasUtils',
	'goo/util/Ajax',
	'goo/util/MeshBuilder',
	'goo/noise/Noise',
	'goo/noise/ValueNoise',
	'goo/shapes/TerrainSurface',
	'goo/shapes/ShapeCreator',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/util/rsvp'
],
/** @lends */
function(
	MeshDataComponent,
	Material,
	Camera,
	MathUtils,
	Vector3,
	Transform,
	TextureCreator,
	Texture,
	MeshData,
	Shader,
	DirectionalLight,
	CanvasUtils,
	Ajax,
	MeshBuilder,
	Noise,
	ValueNoise,
	TerrainSurface,
	ShapeCreator,
	ShaderBuilder,
	RSVP
) {
	"use strict";

	function Vegetation() {		
		this.calcVec = new Vector3();
	}

	Vegetation.prototype.init = function(world, worldScript) {
		var promise = new RSVP.Promise();

		this.world = world;
		this.worldScript = worldScript;

		// var meshData = this.createBase(1.0, 0.5);
		this.vegetationList = [];
		for (var i = 0; i < types.length; i++) {
			var meshData = this.createBase(types[i]);
			this.vegetationList[i] = meshData;
		}

		var texture = new TextureCreator().loadTexture2D(window.hunterResources + '/grassatlas_0_DIF_test.dds', null, function() {
			promise.resolve();
		});
		texture.anisotropy = 16;

		var material = Material.createMaterial(vegetationShader, 'vegetation');
		material.setTexture('DIFFUSE_MAP', texture);
		material.cullState.enabled = false;
		// material.uniforms.discardThreshold = 0.25;
		material.uniforms.discardThreshold = 0.2;
		material.blendState.blending = 'CustomBlending';
		material.uniforms.materialAmbient = [0.3, 0.3, 0.3, 0.3];
		material.uniforms.materialSpecular = [0, 0, 0, 0];
		material.renderQueue = 3001;
		this.material = material;
		this.vegType = 0;

		this.patchSize = 10;
		this.patchDensity = 20;
		this.gridSize = 9;
		// this.patchSize = 5;
		// this.patchDensity = 10;
		// this.gridSize = 15;

		this.patchSpacing = this.patchSize / this.patchDensity; 
		this.gridSizeHalf = Math.floor(this.gridSize*0.5);
		this.grid = [];
		var dummyMesh = this.createPatch(0, 0);
		for (var x = 0; x < this.gridSize; x++) {
			this.grid[x] = [];
			for (var z = 0; z < this.gridSize; z++) {
				var entity = this.world.createEntity(this.material);
				var meshDataComponent = new MeshDataComponent(dummyMesh);
				meshDataComponent.modelBound.xExtent = this.patchSize;
				meshDataComponent.modelBound.yExtent = 50;
				meshDataComponent.modelBound.zExtent = this.patchSize;
				meshDataComponent.autoCompute = false;
				entity.set(meshDataComponent);
				entity.addToWorld();
				this.grid[x][z] = entity;
			}
		}

		this.currentX = -10000;
		this.currentZ = -10000;

		return promise;
	};

	Vegetation.prototype.circleVegetation = function(xx, zz) {
		this.vegType++;
		this.vegType %= 15;
		this.currentX = -10000;
		this.currentZ = -10000;
	};


	Vegetation.prototype.getVegetationType = function(xx, zz) {
		if (this.vegType === 0) {
			var mx = (Math.sin(xx * 0.1) * 0.5 + 0.5);
			// var my = (Math.sin(yy * 0.1) * 0.5 + 0.5);
			var mz = (Math.sin(zz * 0.15) * 0.5 + 0.5);
			var tt = (mx + mz) / 2.0;
			var vegetationType = Math.floor(tt * this.vegetationList.length);
			var rand = ((Math.random()+Math.random()+Math.random()+Math.random()-2)/4.0) + 0.0;
			vegetationType = Math.floor(MathUtils.clamp(vegetationType+rand*4, 0, this.vegetationList.length-1));
			// var vegetationType = Math.floor(rand*this.vegetationList.length);
			// var vegetationType = MathUtils.moduloPositive(patchX, 3);
			// var vegetationType = MathUtils.moduloPositive(patchX, this.vegetationList.length);

			return vegetationType;
		}

		return this.vegType-1;
	};

	Vegetation.prototype.update = function(x, z) {
		var newX = Math.floor(x / this.patchSize);
		var newZ = Math.floor(z / this.patchSize);

		if (this.currentX === newX && this.currentZ === newZ) {
			return;
		}

		console.time('vegetation update');

		for (var x = 0; x < this.gridSize; x++) {
			for (var z = 0; z < this.gridSize; z++) {
				var patchX = newX + x;
				var patchZ = newZ + z;

				var diffX = patchX - this.currentX;
				var diffZ = patchZ - this.currentZ;
				if (diffX >= 0 && diffX < this.gridSize && diffZ >= 0 && diffZ < this.gridSize) {
					continue;
				}

				patchX -= this.gridSizeHalf;
				patchZ -= this.gridSizeHalf;
				var modX = MathUtils.moduloPositive(patchX, this.gridSize);
				var modZ = MathUtils.moduloPositive(patchZ, this.gridSize);

				patchX *= this.patchSize;
				patchZ *= this.patchSize;

				var entity = this.grid[modX][modZ];
				if (entity) {
					// unload cell
				}

				var meshData = this.createPatch(patchX, patchZ);
				entity.meshDataComponent.meshData = meshData;
				// entity.meshDataComponent.modelBound.center.setd(patchX, 0, patchZ);
				entity.meshRendererComponent.worldBound.center.setd(patchX + this.patchSize * 0.5, 0, patchZ + this.patchSize * 0.5);
			}
		}

		this.currentX = newX;
		this.currentZ = newZ;

		console.timeEnd('vegetation update');
	};

	Vegetation.prototype.createPatch = function(patchX, patchZ) {
		var meshBuilder = new MeshBuilder();
		var transform = new Transform();

		var patchDensity = this.patchDensity;
		var patchSpacing = this.patchSpacing; 
		var pos = [0, 10, 0];
		for (var x = 0; x < patchDensity; x++) {
			for (var z = 0; z < patchDensity; z++) {
				var xx = patchX + (x + Math.random()*0.5) * patchSpacing;
				var zz = patchZ + (z + Math.random()*0.5) * patchSpacing;
				pos[0] = xx;
				pos[2] = zz;
				var yy = this.worldScript.getTerrainHeightAt(pos);
				var norm = this.worldScript.getTerrainNormalAt(pos);
				if (yy === null) {
					yy = 0;
				}
				if (norm === null) {
					norm = Vector3.UNIT_Y;
				}
				var slope = norm.dot(Vector3.UNIT_Y);
				if (slope < 0.9) {
					continue;
				}

				var size = Math.random() * 0.4 + 0.8;
				transform.scale.setd(size, size, size);
				transform.translation.setd(0, 0, 0);
				var angle = Math.random() * Math.PI * 0.5;
				var anglex = Math.sin(angle);
				var anglez = Math.cos(angle);
				this.calcVec.setd(anglex, 0.0, anglez);
				transform.lookAt(this.calcVec, norm);
				transform.translation.setd(xx, yy, zz);
				transform.update();

				var vegetationType = this.getVegetationType(xx, zz);
				var meshData = this.vegetationList[vegetationType];
				meshBuilder.addMeshData(meshData, transform);
			}
		}
		var meshDatas = meshBuilder.build();

		return meshDatas[0]; // Don't create patches bigger than 65k
	};

	Vegetation.prototype.createBase = function(type) {
		var meshData = ShapeCreator.createQuad(type.w, type.h, 1, 1);
		meshData.attributeMap.BASE = MeshData.createAttribute(1, 'Float'),
		meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);

		meshData.getAttributeBuffer(MeshData.NORMAL).set([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
		meshData.getAttributeBuffer(MeshData.TEXCOORD0).set([
			type.tx, type.ty,
			type.tx, type.ty + type.th,
			type.tx + type.tw, type.ty + type.th,
			type.tx + type.tw, type.ty
		]);

		meshData.getAttributeBuffer('BASE').set([
			0, type.h, type.h, 0
		]);

		var meshBuilder = new MeshBuilder();
		var transform = new Transform();
		transform.translation.y = type.h * 0.5 - type.h * 0.1;
		transform.update();

		meshBuilder.addMeshData(meshData, transform);

		transform.setRotationXYZ(0, Math.PI * 0.5, 0);
		transform.update();

		meshBuilder.addMeshData(meshData, transform);

		var meshDatas = meshBuilder.build();

		return meshDatas[0];
	};


	var types = [
		{ w: 1, h: 0.5, tx: 0.00, ty: 0.875, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.25, ty: 0.875, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.50, ty: 0.875, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.00, ty: 0.75, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.25, ty: 0.75, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.50, ty: 0.75, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.50, ty: 0.25, tw: 0.25, th: 0.125 },
		// { w: 1, h: 0.5, tx: 0.50, ty: 0.375, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.75, ty: 0.25, tw: 0.25, th: 0.125 },
		// { w: 1, h: 0.5, tx: 0.75, ty: 0.375, tw: 0.25, th: 0.125 },

		{ w: 1, h: 1, tx: 0.00, ty: 0.00, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.25, ty: 0.00, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.00, ty: 0.25, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.25, ty: 0.25, tw: 0.25, th: 0.25 },
		// { w: 1, h: 1, tx: 0.00, ty: 0.50, tw: 0.25, th: 0.25 },
		// { w: 1, h: 1, tx: 0.25, ty: 0.50, tw: 0.25, th: 0.25 },
		// { w: 1, h: 1, tx: 0.50, ty: 0.50, tw: 0.25, th: 0.25 },
		// { w: 1, h: 1, tx: 0.75, ty: 0.50, tw: 0.25, th: 0.25 },

		// { w: 2, h: 2, tx: 0.75, ty: 0.75, tw: 0.25, th: 0.25 },
	];

	var vegetationShader = {
		processors: [
			ShaderBuilder.light.processor
		],
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexNormal : MeshData.NORMAL,
			vertexUV0 : MeshData.TEXCOORD0,
			base : 'BASE'
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraPosition : Shader.CAMERA,
			diffuseMap : Shader.DIFFUSE_MAP,
			discardThreshold: -0.01,
			fogSettings: [0, 220],
			fogColor: [1, 1, 1],
			time : Shader.TIME
		},
		builder: function (shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function () {
			return [
		'attribute vec3 vertexPosition;',
		'attribute vec3 vertexNormal;',
		'attribute vec2 vertexUV0;',
		'attribute float base;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform vec3 cameraPosition;',
		'uniform float time;',

		ShaderBuilder.light.prevertex,

		'varying vec3 normal;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',
		'varying vec2 texCoord0;',
		'varying float dist;',

		'void main(void) {',
			'vec3 swayPos = vertexPosition;',
			'swayPos.x += sin(time * 0.5 + swayPos.x * 0.4) * base * sin(time * 1.5 + swayPos.y * 0.4) * 0.1 + 0.08;',
		'	vec4 worldPos = worldMatrix * vec4(swayPos, 1.0);',
		'	vWorldPos = worldPos.xyz;',
		'	gl_Position = viewProjectionMatrix * worldPos;',

			ShaderBuilder.light.vertex,

		'	normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
		'	texCoord0 = vertexUV0;',
		'	viewPosition = cameraPosition - worldPos.xyz;',
			'dist = 1.0 - smoothstep(35.0, 40.0, length(viewPosition.xz));',
		'}'//
		].join('\n');
		},
		fshader: function () {
			return [
		'uniform sampler2D diffuseMap;',
		'uniform float discardThreshold;',
		'uniform vec2 fogSettings;',
		'uniform vec3 fogColor;',

		ShaderBuilder.light.prefragment,

		'varying vec3 normal;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',
		'varying vec2 texCoord0;',
		'varying float dist;',

		'void main(void)',
		'{',
		'	vec4 final_color = texture2D(diffuseMap, texCoord0);',
		// '	final_color.a *= dist;',
			'if (final_color.a < discardThreshold) discard;',
		'	final_color.a = min(final_color.a, dist);',
			'if (final_color.a <= 0.0) discard;',

		'	vec3 N = normalize(normal);',

			ShaderBuilder.light.fragment,

		'	final_color.a = pow(final_color.a, 0.5);',

			'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
			'final_color.rgb = mix(final_color.rgb, fogColor, d);',

		'	gl_FragColor = final_color;',
		'}'//
		].join('\n');
		}
	};

	return Vegetation;
});
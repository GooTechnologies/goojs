define([
	'goo/renderer/Material',
	'goo/renderer/Camera',
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
	'goo/renderer/shaders/ShaderBuilder'
],
/** @lends */
function(
	Material,
	Camera,
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
	ShaderBuilder
) {
	"use strict";

	function Vegetation(goo, worldScript) {
		// var meshData = this.createBase(1.0, 0.5);
		var vegetationList = [];
		for (var i = 0; i < types.length; i++) {
			var meshData = this.createBase(types[i]);
			vegetationList[i] = meshData;
		}

		var startX = 13;
		var startZ = 13;

		var meshBuilder = new MeshBuilder();
		var transform = new Transform();
		var spread = 35.0;
		var count = 5000;
		while (count > 0) {
			var xx = (Math.random() * 2.0 - 1.0) * spread + startX;
			var zz = (Math.random() * 2.0 - 1.0) * spread + startZ;
			var pos = [xx, 10, zz];
			var yy = worldScript.getTerrainHeightAt(pos);
			var norm = worldScript.getTerrainNormalAt(pos);
			if (yy === null) {
				yy = 0;
			}
			if (norm === null) {
				norm = new Vector3(0,1,0);
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
			transform.lookAt(new Vector3(anglex, 0.0, anglez), norm);

			transform.translation.setd(xx, yy, zz);

			transform.update();

			var rand = ((Math.random()+Math.random()-1)/2.0) + 0.5;
			var vegetationType = Math.floor(rand*vegetationList.length);
			var meshData = vegetationList[vegetationType];
			meshBuilder.addMeshData(meshData, transform);

			count--;
		}
		var meshDatas = meshBuilder.build();

		var material = Material.createMaterial(vegetationShader, 'vegetation');
		var texture = new TextureCreator().loadTexture2D(window.hunterResources + '/grassatlas_0_DIF.dds');
		material.setTexture('DIFFUSE_MAP', texture);

		material.cullState.enabled = false;
		material.uniforms.discardThreshold = 0.1;
		material.blendState.blending = 'CustomBlending';
		material.uniforms.materialAmbient = [1.0, 1.0, 1.0, 1.0];
		material.renderQueue = 3001;


		for (var key in meshDatas) {
			var entity = goo.world.createEntity(meshDatas[key], material);
			entity.addToWorld();
		}
	}

	var types = [
		{ w: 1, h: 0.5, tx: 0.00, ty: 0.875, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.25, ty: 0.875, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.50, ty: 0.875, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.00, ty: 0.75, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.25, ty: 0.75, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.50, ty: 0.75, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.50, ty: 0.25, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.50, ty: 0.375, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.75, ty: 0.25, tw: 0.25, th: 0.125 },
		{ w: 1, h: 0.5, tx: 0.75, ty: 0.375, tw: 0.25, th: 0.125 },

		{ w: 1, h: 1, tx: 0.00, ty: 0.00, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.25, ty: 0.00, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.00, ty: 0.25, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.25, ty: 0.25, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.00, ty: 0.50, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.25, ty: 0.50, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.50, ty: 0.50, tw: 0.25, th: 0.25 },
		{ w: 1, h: 1, tx: 0.75, ty: 0.50, tw: 0.25, th: 0.25 },

		{ w: 2, h: 2, tx: 0.75, ty: 0.75, tw: 0.25, th: 0.25 },
	];

	Vegetation.prototype.createBase = function(type) {
		var meshData = ShapeCreator.createQuad(type.w, type.h, 1, 1);
		meshData.attributeMap.BASE = MeshData.createAttribute(1, 'Float'),
		meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);
		// meshData.rebuild();

		meshData.getAttributeBuffer(MeshData.TEXCOORD0).set([
			type.tx, type.ty,
			type.tx, type.ty + type.th,
			type.tx + type.tw, type.ty + type.th,
			type.tx + type.tw, type.ty
		]);

		meshData.getAttributeBuffer('BASE').set([
			0, 1 * type.h, 1 * type.h, 0
		]);

		var meshBuilder = new MeshBuilder();
		var transform = new Transform();
		// transform.translation.x = (Math.random() * 2.0 - 1.0) * spread;
		transform.translation.y = type.h * 0.5;
		// transform.translation.z = (Math.random() * 2.0 - 1.0) * spread;
		transform.update();

		meshBuilder.addMeshData(meshData, transform);

		transform.setRotationXYZ(0, Math.PI * 0.5, 0);
		transform.update();

		meshBuilder.addMeshData(meshData, transform);

		var meshDatas = meshBuilder.build();

		return meshDatas[0];
	};

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
		'}'//
		].join('\n');
		},
		fshader: function () {
			return [
		'uniform sampler2D diffuseMap;',
		'uniform float discardThreshold;',

		ShaderBuilder.light.prefragment,

		'varying vec3 normal;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',
		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	vec4 final_color = texture2D(diffuseMap, texCoord0);',
			'if (final_color.a < discardThreshold) discard;',

		'	vec3 N = normalize(normal);',

			ShaderBuilder.light.fragment,

		'	gl_FragColor = final_color;',
		'}'//
		].join('\n');
		}
	};

	return Vegetation;
});
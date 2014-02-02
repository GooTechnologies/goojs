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
	'goo/loaders/DynamicLoader',
	'goo/entities/EntityUtils',
	'goo/util/combine/EntityCombiner',
	'goo/util/TangentGenerator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/util/rsvp'
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
	DynamicLoader,
	EntityUtils,
	EntityCombiner,
	TangentGenerator,
	ScriptComponent,
	ShaderBuilder,
	RSVP
) {
	"use strict";

	function Forrest() {
		this.startX = 20;
		this.startZ = 20;
	}

	Forrest.prototype.init = function(goo, worldScript) {
		var promise = new RSVP.Promise();

		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: window.hunterResources + '/tree1',
		});

		loader.loadFromBundle('project.project', 'root.bundle', {
			recursive: false,
			preloadBinaries: true,
			noEnvironment: true
		}).then(function(configs) {
			goo.world.process();

			var root = loader.getCachedObjectForRef('entities/Veg_T01_aspenM_LOD2-Whole_root.entity');

			var newRoot = goo.world.createEntity('newroot');
			var vec = new Vector3();
			var transform = new Transform();
			var count = 15;
			while (count > 0) {
				var xx = (Math.random() * 2.0 - 1.0);
				var zz = (Math.random() * 2.0 - 1.0);
				vec.setd(xx, 0, zz);
				vec.normalize();
				var dist = Math.random() * 15 + 10;
				vec.muld(dist, dist, dist);
				vec.x += this.startX;
				vec.z += this.startZ;
				xx = vec.x;
				zz = vec.z;
				vec.y = 10;
				var yy = worldScript.getTerrainHeightAt(vec.data);
				var norm = worldScript.getTerrainNormalAt(vec.data);
				var slope = norm.dot(Vector3.UNIT_Y);
				if (slope < 0.9) {
					continue;
				}

				var size = (Math.random() * 0.6 + 0.7) * 0.03;
				transform.scale.setd(size, size, size);
				transform.translation.setd(0, 0, 0);
				var angle = Math.random() * Math.PI * 0.5;
				var anglex = Math.sin(angle);
				var anglez = Math.cos(angle);
				// transform.lookAt(new Vector3(anglex, 0.0, anglez), norm);
				transform.lookAt(new Vector3(anglex, 0.0, anglez), Vector3.UNIT_Y);

				transform.translation.setd(xx, yy, zz);
				transform.update();

				var clone = EntityUtils.clone(goo.world, root);
				clone.transformComponent.transform.copy(transform);
				newRoot.attachChild(clone);

				count--;
			}

			root.removeFromWorld();
			newRoot.addToWorld();

			goo.world.process();

			var combiner = new EntityCombiner(goo.world, 1);
			console.time('combine');
			combiner._combineList(newRoot);
			console.timeEnd('combine');

			console.log(newRoot);

			this.loadLODTrees(goo, worldScript).then(function() {
				promise.resolve();
			});
		}.bind(this)).then(null, function(e) {
			console.error('Failed to load scene: ' + e);
		});

		return promise;
	};

	Forrest.prototype.loadLODTrees = function(goo, worldScript) {
		var promise = new RSVP.Promise();

		var vegetationList = [];
		for (var i = 0; i < types.length; i++) {
			var meshData = this.createBase(types[i]);
			vegetationList[i] = meshData;
		}

		var meshBuilder = new MeshBuilder();
		var vec = new Vector3();
		var transform = new Transform();
		var count = 500;
		for (var x = 0; x < count; x++) {
			var xx = (Math.random() * 2.0 - 1.0);
			var zz = (Math.random() * 2.0 - 1.0);
			vec.setd(xx, 0, zz);
			vec.normalize();
			var dist = Math.random() * 30 + 30;
			vec.muld(dist, dist, dist);
			vec.x += this.startX;
			vec.z += this.startZ;
			xx = vec.x;
			zz = vec.z;
			vec.y = 10;
			var yy = worldScript.getTerrainHeightAt(vec.data);
			if (yy === null) {
				yy = 0;
			}
			var norm = worldScript.getTerrainNormalAt(vec.data);
			if (norm === null) {
				norm = new Vector3(0,1,0);
			}
			var slope = norm.dot(Vector3.UNIT_Y);
			if (slope < 0.9 || yy > 13) {
				continue;
			}

			transform.translation.setd(xx, yy, zz);
			transform.update();

			var meshData = vegetationList[Math.floor(Math.random()*vegetationList.length)];
			meshBuilder.addMeshData(meshData, transform);
		}
		var meshDatas = meshBuilder.build();

		var material = Material.createMaterial(vegetationShader, 'vegetation');
		var texture = new TextureCreator().loadTexture2D(window.hunterResources + '/veg_treeImpostors_full_alpha_0_dif_small.dds', null, function() {
			promise.resolve();
		});
		material.setTexture('DIFFUSE_MAP', texture);
		var texture = new TextureCreator().loadTexture2D(window.hunterResources + '/veg_treeImpostors_0_nrm_small.dds');
		material.setTexture('NORMAL_MAP', texture);

		// material.cullState.enabled = false;
		material.uniforms.discardThreshold = 0.6;
		material.blendState.blending = 'CustomBlending';
		material.uniforms.materialAmbient = [0.2, 0.2, 0.2, 1.0];
		material.uniforms.materialSpecular = [0.0, 0.0, 0.0, 1.0];
		material.renderQueue = 3000;

		for (var key in meshDatas) {
			var entity = goo.world.createEntity(meshDatas[key], material);
			entity.addToWorld();
		}

		return promise;
	};

	var types = [
		{ w: 7, h: 7, tx: 0.00, ty: 0.75, tw: 0.25, th: 0.25 },
		{ w: 7, h: 7, tx: 0.25, ty: 0.5, tw: 0.25, th: 0.25 },
		{ w: 7, h: 7, tx: 0.5, ty: 0.25, tw: 0.25, th: 0.25 },
	];

	Forrest.prototype.createBase = function(type) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0]);
		attributeMap.BASE = MeshData.createAttribute(1, 'Float');
		attributeMap.OFFSET = MeshData.createAttribute(2, 'Float');
		var meshData = new MeshData(attributeMap, 4, 6);

		meshData.getAttributeBuffer(MeshData.POSITION).set([
			0, -type.h * 0.1, 0, 
			0, -type.h * 0.1, 0, 
			0, -type.h * 0.1, 0, 
			0, -type.h * 0.1, 0
		]);
		meshData.getAttributeBuffer(MeshData.TEXCOORD0).set([
			type.tx, type.ty,
			type.tx, type.ty + type.th,
			type.tx + type.tw, type.ty + type.th,
			type.tx + type.tw, type.ty
		]);
		meshData.getAttributeBuffer('BASE').set([
			0, type.h, type.h, 0
		]);
		meshData.getAttributeBuffer('OFFSET').set([
			-type.w*0.5, 0, 
			-type.w*0.5, type.h, 
			type.w*0.5, type.h, 
			type.w*0.5, 0
		]);

		meshData.getIndexBuffer().set([0, 3, 1, 1, 3, 2]);

		return meshData;
	};

	var vegetationShader = {
		processors: [
			ShaderBuilder.light.processor
		],
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0,
			base : 'BASE',
			offset : 'OFFSET'
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			cameraPosition : Shader.CAMERA,
			diffuseMap : Shader.DIFFUSE_MAP,
			normalMap : Shader.NORMAL_MAP,
			discardThreshold: -0.01,
			fogSettings: function() {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function() {
				return ShaderBuilder.FOG_COLOR;
			},
			time : Shader.TIME
		},
		builder: function (shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function () {
			return [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',
		'attribute float base;',
		'attribute vec2 offset;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform vec3 cameraPosition;',
		'uniform float time;',

		ShaderBuilder.light.prevertex,

		'varying vec3 normal;',
		'varying vec3 binormal;',
		'varying vec3 tangent;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',
		'varying vec2 texCoord0;',

		'void main(void) {',
			'vec3 swayPos = vertexPosition;',

			'vec3 nn = cameraPosition - swayPos.xyz;',
			'nn.y = 0.0;',
			'normal = normalize(nn);',
			'tangent = cross(vec3(0.0, 1.0, 0.0), normal);',
			'binormal = cross(normal, tangent);',
			'swayPos.xz += tangent.xz * offset.x;',
			'swayPos.y += offset.y;',

			'swayPos.x += sin(time * 0.5 + swayPos.x * 0.4) * base * sin(time * 1.5 + swayPos.y * 0.4) * 0.02 + 0.01;',

		'	vec4 worldPos = vec4(swayPos, 1.0);',
		'	vWorldPos = worldPos.xyz;',
		'	gl_Position = viewProjectionMatrix * worldPos;',

			ShaderBuilder.light.vertex,

		'	texCoord0 = vertexUV0;',
		'	viewPosition = cameraPosition - worldPos.xyz;',
		'}'//
		].join('\n');
		},
		fshader: function () {
			return [
		'uniform sampler2D diffuseMap;',
		'uniform sampler2D normalMap;',
		'uniform float discardThreshold;',
		'uniform vec2 fogSettings;',
		'uniform vec3 fogColor;',

		ShaderBuilder.light.prefragment,

		'varying vec3 normal;',
		'varying vec3 binormal;',
		'varying vec3 tangent;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',
		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	vec4 final_color = texture2D(diffuseMap, texCoord0);',
			'if (final_color.a < discardThreshold) discard;',
			// 'final_color = vec4(1.0);',

			'mat3 tangentToWorld = mat3(tangent, binormal, normal);',
			'vec3 tangentNormal = texture2D(normalMap, texCoord0).xyz * vec3(2.0) - vec3(1.0);',
			'vec3 worldNormal = (tangentToWorld * tangentNormal);',
			'vec3 N = normalize(worldNormal);',

			// 'final_color = vec4(N, 1.0);',
			ShaderBuilder.light.fragment,

			'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
			'final_color.rgb = mix(final_color.rgb, fogColor, d);',

		'	gl_FragColor = final_color;',
		'}'//
		].join('\n');
		}
	};

	return Forrest;
});
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
	'goo/addons/terrainpack/TerrainSurface',
	'goo/loaders/DynamicLoader',
	'goo/entities/EntityUtils',
	'goo/util/combine/EntityCombiner',
	'goo/util/TangentGenerator',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/math/MathUtils',
	'goo/util/rsvp'
], function (
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
	DynamicLoader,
	EntityUtils,
	EntityCombiner,
	TangentGenerator,
	MeshDataComponent,
	ScriptComponent,
	ShaderBuilder,
	MathUtils,
	RSVP
) {
	'use strict';

	function Forrest() {
		this.calcVec = new Vector3();
		this.initDone = false;
	}

	var chainBundleLoading = function (world, promise, bundle) {
		var loader = new DynamicLoader({
			world: world,
			preloadBinaries: true,
			rootPath: "res/trees2"
		});
		return promise.then(function () {
			console.log("loading bundle ", bundle);
			return loader.load("root.bundle");
		}).then(function (configs) {
			// find scene and update it.
			for (var ref in configs) {
				console.log(ref);
				// if (ref.indexOf(".scene") != -1) {
				// 	return loader.update(ref, configs[ref]).then(function () {
				// 		return configs;
				// 	});
				// }
			}
			console.error("Config in bundle ", bundle, " contained no scene?!");
		});
	};

	Forrest.prototype.init = function (world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, entityMap) {
		var p = new RSVP.Promise();

		var bundlesToLoad = ["fish"];
		for (var i = 0; i < bundlesToLoad.length; i++) {
			p = chainBundleLoading(world, p, bundlesToLoad[i]);
		}

		p.then(function () {
			console.log("loaded forrest", forrestTypes);
		}, function (e) {
			console.log("Error! ", e);
		}).then(null, function (e) {
			console.log("Error! ", e);
		});

		return this.loadLODTrees(world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, entityMap);
	};

	Forrest.prototype.loadLODTrees = function (world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, entityMap) {
		this.terrainQuery = terrainQuery;
		this.forrestTypes = forrestTypes;
		this.entityMap = entityMap || {};
		this.world = world;

		this.vegetationList = {};
		for (var type in forrestTypes) {
			var typeSettings = forrestTypes[type];
			var meshData = this.createBase(typeSettings);
			this.vegetationList[type] = meshData;
		}

		var material = new Material(vegetationShader, 'vegetation');
		material.setTexture('DIFFUSE_MAP', forrestAtlasTexture);
		material.setTexture('NORMAL_MAP', forrestAtlasNormals);
		material.uniforms.discardThreshold = 0.6;
		// material.blendState.blending = 'CustomBlending';
		material.uniforms.materialAmbient = [0, 0, 0, 0];
		material.uniforms.materialDiffuse = [1, 1, 1, 1];
		material.uniforms.materialSpecular = [0, 0, 0, 0];
		material.renderQueue = 2001;
		this.material = material;

		// this.patchSize = 64;
		// this.patchDensity = 10;
		// this.gridSize = 7;
		// this.minDist = 0;
		this.patchSize = 32;
		this.patchDensity = 5;
		this.gridSize = 7;
		this.minDist = 1.5;

		this.patchSpacing = this.patchSize / this.patchDensity;
		this.gridSizeHalf = Math.floor(this.gridSize * 0.5);
		this.grid = [];
		this.gridState = [];
		var dummyMesh = this.createForrestPatch(0, 0, 1);
		for (var x = 0; x < this.gridSize; x++) {
			this.grid[x] = [];
			this.gridState[x] = [];
			for (var z = 0; z < this.gridSize; z++) {
				var entity = world.createEntity(this.material);
				var meshDataComponent = new MeshDataComponent(dummyMesh);
				meshDataComponent.modelBound.xExtent = this.patchSize;
				meshDataComponent.modelBound.yExtent = 500;
				meshDataComponent.modelBound.zExtent = this.patchSize;
				meshDataComponent.autoCompute = false;
				entity.set(meshDataComponent);
				entity.addToWorld();
				this.grid[x][z] = entity;
				this.gridState[x][z] = {
					lod: -1,
					x: -1,
					z: -1
				};
				entity.meshRendererComponent.hidden = true;
			}
		}

		this.currentX = -10000;
		this.currentZ = -10000;

		this.initDone = true;
	};

	Forrest.prototype.rebuild = function () {
		this.currentX = -10000;
		this.currentZ = -10000;
	};

	var hidden = false;
	Forrest.prototype.toggle = function () {
		hidden = !hidden;
		for (var x = 0; x < this.gridSize; x++) {
			for (var z = 0; z < this.gridSize; z++) {
				var entity = this.grid[x][z];
				entity.skip = hidden;
			}
		}
		if (!hidden) {
			this.rebuild();
		}
	};

	Forrest.prototype.update = function (x, z) {
		if (!this.initDone || hidden) {
			return;
		}

		var newX = Math.floor(x / this.patchSize);
		var newZ = Math.floor(z / this.patchSize);

		if (this.currentX === newX && this.currentZ === newZ) {
			return;
		}

		// console.time('forrest update');

		for (var x = 0; x < this.gridSize; x++) {
			for (var z = 0; z < this.gridSize; z++) {
				var patchX = newX + x;
				var patchZ = newZ + z;

				patchX -= this.gridSizeHalf;
				patchZ -= this.gridSizeHalf;
				var modX = MathUtils.moduloPositive(patchX, this.gridSize);
				var modZ = MathUtils.moduloPositive(patchZ, this.gridSize);
				var entity = this.grid[modX][modZ];
				var state = this.gridState[modX][modZ];

				//
				var testX = Math.abs(x - this.gridSizeHalf);
				var testZ = Math.abs(z - this.gridSizeHalf);
				var levelOfDetail = 1;
				if (testX < this.minDist && testZ < this.minDist) {
					levelOfDetail = 2;
				}

				// recycle if same settings
				if (state.lod === levelOfDetail && state.x === patchX && state.z === patchZ) {
					continue;
				}

				// store grid patch state and re-generate
				state.lod = levelOfDetail;
				state.x = patchX;
				state.z = patchZ;

				patchX *= this.patchSize;
				patchZ *= this.patchSize;
				var meshData = this.createForrestPatch(patchX, patchZ, levelOfDetail, entity);
				if (meshData && meshData.vertexCount > 0) {
					entity.meshDataComponent.meshData = meshData;
					entity.meshRendererComponent.hidden = false;
				} else {
					entity.meshRendererComponent.hidden = true;
				}
				entity.meshRendererComponent.worldBound.center.setDirect(patchX + this.patchSize * 0.5, 0, patchZ + this.patchSize * 0.5);
			}
		}

		this.currentX = newX;
		this.currentZ = newZ;

		// console.timeEnd('forrest update');
	};

	Forrest.prototype.determineVegTypeAtPos = function (pos) {
		var norm = this.terrainQuery.getNormalAt(pos);
		if (norm === null) {
			norm = Vector3.UNIT_Y;
		}
		var slope = norm.dot(Vector3.UNIT_Y);
		return this.terrainQuery.getForrestType(pos[0], pos[2], slope, MathUtils.fastRandom());
	};

	Forrest.prototype.fetchTreeMesh = function (vegetationType) {
        return EntityUtils.clone(this.world, this.entityMap[vegetationType]);
	};

	Forrest.prototype.fetchTreeBillboard = function (vegetationType, size) {
		var meshData = this.vegetationList[vegetationType];
		var type = this.forrestTypes[vegetationType];
		var w = type.w * size;
		var h = type.h * size;
		meshData.getAttributeBuffer('OFFSET').set([
			-w * 0.5, 0,
			-w * 0.5, h,
			w * 0.5, h,
			w * 0.5, 0
		]);
		return meshData;
	};

	Forrest.prototype.getPointInPatch = function (x, z, patchX, patchZ, patchSpacing) {
		var pos = [0, 0, 0];
		pos[0] = patchX + (x + MathUtils.fastRandom() * 0.75) * patchSpacing;
		pos[2] = 0.5 + patchZ + (z + MathUtils.fastRandom() * 0.75) * patchSpacing;

		pos[1] = this.terrainQuery.getHeightAt(pos);
		if (pos[1] === null) {
			pos[1] = 0;
		}
		return pos;
	};

	Forrest.prototype.addVegMeshToPatch = function (vegetationType, pos, meshBuilder, levelOfDetail, gridEntity) {
		var transform = new Transform();
		var size = (MathUtils.fastRandom() * 0.5 + 0.75);
		transform.translation.set(pos);
		transform.update();
		// var meshData;
		var useMesh = gridEntity && ((levelOfDetail === 2) || (this.forrestTypes[vegetationType].forbidden === true));

		if (useMesh && this.entityMap[vegetationType]) {
			var treeEntity = this.fetchTreeMesh(vegetationType);
			treeEntity.transformComponent.transform.scale.scale(size);
			treeEntity.transformComponent.transform.translation.set(pos);
			treeEntity.addToWorld();
			gridEntity.attachChild(treeEntity);
			if (this.onAddedVegMesh) {
				this.onAddedVegMesh(vegetationType, treeEntity, pos, size);
			}
		} else {
			var meshData = this.fetchTreeBillboard(vegetationType, size);
			meshBuilder.addMeshData(meshData, transform);
		}
	};


	Forrest.prototype.createForrestPatch = function (patchX, patchZ, levelOfDetail, gridEntity) {
		var meshBuilder = new MeshBuilder();
		var patchDensity = this.patchDensity;
		var patchSpacing = this.patchSpacing;

		if (gridEntity) {
			// remove any previous old trees.
			gridEntity.traverse(function (entity, level) {
				if (level > 0) {
					entity.removeFromWorld();
				}
			});
		}

		MathUtils.randomSeed = patchX * 10000 + patchZ;
		for (var x = 0; x < patchDensity; x++) {
			for (var z = 0; z < patchDensity; z++) {

				var pos = this.getPointInPatch(x, z, patchX, patchZ, patchSpacing);
				var vegetationType = this.determineVegTypeAtPos(pos);

				if (vegetationType) {
					 this.addVegMeshToPatch(vegetationType, pos, meshBuilder, levelOfDetail, gridEntity);
				}
				// console.count('tree');
			}
		}

		var meshDatas = meshBuilder.build();
		if (levelOfDetail === 2) {
			new EntityCombiner(this.world, 1, true, true)._combineList(gridEntity);
		}

		return meshDatas[0]; // Don't create patches bigger than 65k
	};

	Forrest.prototype.createBase = function (type) {
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
			-type.w * 0.5, 0,
			-type.w * 0.5, type.h,
			type.w * 0.5, type.h,
			type.w * 0.5, 0
		]);

		meshData.getIndexBuffer().set([0, 3, 1, 1, 3, 2]);

		return meshData;
	};

	var vegetationShader = {
		processors: [
			ShaderBuilder.light.processor,
			function (shader) {
				if (ShaderBuilder.USE_FOG) {
					shader.setDefine('FOG', true);
					shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
					shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
				} else {
					shader.removeDefine('FOG');
				}
			}
		],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0,
			base: 'BASE',
			offset: 'OFFSET'
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			cameraPosition: Shader.CAMERA,
			diffuseMap: Shader.DIFFUSE_MAP,
			normalMap: Shader.NORMAL_MAP,
			discardThreshold: -0.01,
			fogSettings: function () {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function () {
				return ShaderBuilder.FOG_COLOR;
			},
			time: Shader.TIME
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

			'#ifdef FOG',
			'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
			'final_color.rgb = mix(final_color.rgb, fogColor, d);',
			'#endif',

		'	gl_FragColor = final_color;',
		'}'//
		].join('\n');
		}
	};

	return Forrest;
});
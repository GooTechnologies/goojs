/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([19],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(502);


/***/ },

/***/ 502:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		Forrest: __webpack_require__(503),
		Terrain: __webpack_require__(504),
		TerrainHandler: __webpack_require__(505),
		TerrainSurface: __webpack_require__(507),
		Vegetation: __webpack_require__(506)
	};
	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },

/***/ 503:
/***/ function(module, exports, __webpack_require__) {

	var Material = __webpack_require__(30);
	var Vector3 = __webpack_require__(8);
	var Transform = __webpack_require__(41);
	var MeshData = __webpack_require__(14);
	var Shader = __webpack_require__(31);
	var MeshBuilder = __webpack_require__(112);
	var DynamicLoader = __webpack_require__(318);
	var EntityUtils = __webpack_require__(3);
	var EntityCombiner = __webpack_require__(341);
	var MeshDataComponent = __webpack_require__(215);
	var ShaderBuilder = __webpack_require__(48);
	var MathUtils = __webpack_require__(9);
	var RSVP = __webpack_require__(55);

	function Forrest() {
		this.calcVec = new Vector3();
		this.initDone = false;
	}

	var chainBundleLoading = function (world, promise, bundle) {
		var loader = new DynamicLoader({
			world: world,
			preloadBinaries: true,
			rootPath: 'res/trees2'
		});
		return promise.then(function () {
			console.log('loading bundle ', bundle);
			return loader.load('root.bundle');
		}).then(function (configs) {
			// find scene and update it.
			for (var ref in configs) {
				console.log(ref);
				// if (ref.indexOf('.scene') != -1) {
				// 	return loader.update(ref, configs[ref]).then(function () {
				// 		return configs;
				// 	});
				// }
			}
			console.error('Config in bundle ', bundle, ' contained no scene?!');
		});
	};

	Forrest.prototype.init = function (world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, entityMap) {
		var p = new RSVP.Promise();

		var bundlesToLoad = ['fish'];
		for (var i = 0; i < bundlesToLoad.length; i++) {
			p = chainBundleLoading(world, p, bundlesToLoad[i]);
		}

		p.then(function () {
			console.log('loaded forrest', forrestTypes);
		}, function (e) {
			console.log('Error! ', e);
		}).then(null, function (e) {
			console.log('Error! ', e);
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

	module.exports = Forrest;

/***/ },

/***/ 504:
/***/ function(module, exports, __webpack_require__) {

	var MathUtils = __webpack_require__(9);
	var Transform = __webpack_require__(41);
	var MeshData = __webpack_require__(14);
	var Material = __webpack_require__(30);
	var Shader = __webpack_require__(31);
	var ShaderBuilder = __webpack_require__(48);
	var ShaderLib = __webpack_require__(46);
	var ShaderFragment = __webpack_require__(47);
	var RenderTarget = __webpack_require__(133);
	var Texture = __webpack_require__(53);
	var Renderer = __webpack_require__(123);
	var FullscreenPass = __webpack_require__(135);
	var FullscreenUtils = __webpack_require__(136);
	var DirectionalLight = __webpack_require__(51);
	var Quad = __webpack_require__(28);

	/* global Ammo */

	/**
	 * A terrain
	 */
	function Terrain(goo, size, count) {
		this.world = goo.world;
		this.renderer = goo.renderer;
		this.size = size;
		this.count = count;
		this.splatMult = 2;

		this._gridCache = {};

		var brush = new Quad(2 / size, 2 / size);

		var mat = this.drawMaterial1 = new Material(brushShader);
		mat.blendState.blending = 'AdditiveBlending';
		mat.cullState.cullFace = 'Front';

		var mat2 = this.drawMaterial2 = new Material(brushShader2);
		mat2.cullState.cullFace = 'Front';

		var mat3 = this.drawMaterial3 = new Material(brushShader3);
		mat3.uniforms.size = 1 / size;
		mat3.cullState.cullFace = 'Front';

		var mat4 = this.drawMaterial4 = new Material(brushShader4);
		mat4.cullState.cullFace = 'Front';

		this.renderable = {
			meshData: brush,
			materials: [mat],
			transform: new Transform()
		};
		this.renderable.transform.setRotationXYZ(0, 0, Math.PI * 0.5);

		this.copyPass = new FullscreenPass(ShaderLib.screenCopy);
		this.copyPass.material.depthState.enabled = false;

		this.upsamplePass = new FullscreenPass(upsampleShader);
		this.upsamplePass.material.depthState.enabled = false;

		this.normalmapPass = new FullscreenPass(normalmapShader);
		this.normalmapPass.material.depthState.enabled = false;
		this.normalmapPass.material.uniforms.resolution = [size, size];
		this.normalmapPass.material.uniforms.height = 10;

		this.extractFloatPass = new FullscreenPass(extractShader);
		// this.detailmapPass = new FullscreenPass(detailShader);

		this.normalMap = new RenderTarget(size, size);
		// this.detailMap = new RenderTarget(size, size);

		this.textures = [];
		this.texturesBounce = [];
		for (var i = 0; i < count; i++) {
			this.textures[i] = new RenderTarget(size, size, {
				magFilter: 'NearestNeighbor',
				minFilter: 'NearestNeighborNoMipMaps',
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp',
				generateMipmaps: false,
				type: 'Float'
			});
			this.texturesBounce[i] = new RenderTarget(size, size, {
				magFilter: 'NearestNeighbor',
				minFilter: 'NearestNeighborNoMipMaps',
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp',
				generateMipmaps: false,
				type: 'Float'
			});

			size *= 0.5;
		}

		mat3.setTexture('HEIGHT_MAP', this.texturesBounce[0]);
		mat4.setTexture('HEIGHT_MAP', this.texturesBounce[0]);

		this.n = 31;
		this.gridSize = (this.n + 1) * 4 - 1;
		console.log('grid size: ', this.gridSize);

		this.splat = new RenderTarget(this.size * this.splatMult, this.size * this.splatMult, {
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp',
				generateMipmaps: false
		});
		this.splatCopy = new RenderTarget(this.size * this.splatMult, this.size * this.splatMult, {
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp',
				generateMipmaps: false
		});
		mat2.setTexture('SPLAT_MAP', this.splatCopy);
	}

	Terrain.prototype.init = function (terrainTextures) {
		var world = this.world;
		var count = this.count;

		var entity = this.terrainRoot = world.createEntity('TerrainRoot');
		entity.addToWorld();
		this.clipmaps = [];
		for (var i = 0; i < count; i++) {
			var size = Math.pow(2, i);

			var material = new Material(terrainShaderDefFloat, 'clipmap' + i);
			material.uniforms.materialAmbient = [0.0, 0.0, 0.0, 1.0];
			material.uniforms.materialDiffuse = [1.0, 1.0, 1.0, 1.0];
			material.cullState.frontFace = 'CW';
			// material.wireframe = true;
			material.uniforms.resolution = [1, 1 / size, this.size, this.size];
			material.uniforms.resolutionNorm = [this.size, this.size];

			var clipmapEntity = this.createClipmapLevel(world, material, i);
			clipmapEntity.setScale(size, 1, size);
			entity.attachChild(clipmapEntity);

			var terrainPickingMaterial = new Material(terrainPickingShader, 'terrainPickingMaterial' + i);
			terrainPickingMaterial.cullState.frontFace = 'CW';
			terrainPickingMaterial.uniforms.resolution = [1, 1 / size, this.size, this.size];
			terrainPickingMaterial.blendState = {
				blending: 'NoBlending',
				blendEquation: 'AddEquation',
				blendSrc: 'SrcAlphaFactor',
				blendDst: 'OneMinusSrcAlphaFactor'
			};

			this.clipmaps[i] = {
				clipmapEntity: clipmapEntity,
				level: i,
				size: size,
				currentX: 100000,
				currentY: 100000,
				currentZ: 100000,
				origMaterial: material,
				terrainPickingMaterial: terrainPickingMaterial
			};
		}

		var parentClipmap = this.clipmaps[this.clipmaps.length - 1];
		for (var i = this.clipmaps.length - 2; i >= 0; i--) {
			var clipmap = this.clipmaps[i];
			clipmap.parentClipmap = parentClipmap;
			parentClipmap = clipmap;
		}

		// edit marker
		var light = new DirectionalLight();
		light.shadowSettings.size = 10;
		var lightEntity = this.lightEntity = world.createEntity(light);
		lightEntity.setTranslation(200, 200, 200);
		lightEntity.setRotation(-Math.PI * 0.5, 0, 0);
		lightEntity.addToWorld();
		this.lightEntity.lightComponent.hidden = true;

		this.floatTexture = terrainTextures.heightMap instanceof Texture ? terrainTextures.heightMap : new Texture(terrainTextures.heightMap, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps',
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp',
			generateMipmaps: false,
			format: 'Luminance'
		}, this.size, this.size);

		this.splatTexture = terrainTextures.splatMap instanceof Texture ? terrainTextures.splatMap : new Texture(terrainTextures.splatMap, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps',
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp',
			generateMipmaps: false,
			flipY: false
		}, this.size * this.splatMult, this.size * this.splatMult);

		for (var i = 0; i < this.count; i++) {
			var material = this.clipmaps[i].origMaterial;
			var texture = this.textures[i];

			material.setTexture('HEIGHT_MAP', texture);
			material.setTexture('NORMAL_MAP', this.normalMap);
			material.setTexture('DETAIL_MAP', this.detailMap);

			material.setTexture('SPLAT_MAP', this.splat);
			material.setTexture('GROUND_MAP1', terrainTextures.ground1);
			material.setTexture('GROUND_MAP2', terrainTextures.ground2);
			material.setTexture('GROUND_MAP3', terrainTextures.ground3);
			material.setTexture('GROUND_MAP4', terrainTextures.ground4);
			material.setTexture('GROUND_MAP5', terrainTextures.ground5);
			material.setTexture('STONE_MAP', terrainTextures.stone);

			var terrainPickingMaterial = this.clipmaps[i].terrainPickingMaterial;
			terrainPickingMaterial.setTexture('HEIGHT_MAP', texture);
		}

		// var normalAdd = new TextureCreator().loadTexture2D('res/terrain/grass2n.jpg', {
			// anisotropy: 4
		// }, function (texture) {});
		// this.normalmapPass.material.setTexture('NORMAL_MAP', normalAdd);

		// var material = this.detailmapPass.material;
		// material.setTexture('NORMAL_MAP', this.normalMap);
		// material.setTexture('SPLAT_MAP', this.splat);
		// material.setTexture('GROUND_MAP1', terrainTextures.ground1);
		// material.setTexture('GROUND_MAP2', terrainTextures.ground2);
		// material.setTexture('GROUND_MAP3', terrainTextures.ground3);
		// material.setTexture('GROUND_MAP4', terrainTextures.ground4);
		// material.setTexture('GROUND_MAP5', terrainTextures.ground5);
		// material.setTexture('STONE_MAP', terrainTextures.stone);

		this.copyPass.render(this.renderer, this.textures[0], this.floatTexture);
		this.copyPass.render(this.renderer, this.splatCopy, this.splatTexture);
		this.copyPass.render(this.renderer, this.splat, this.splatTexture);

		this.updateTextures();
	};

	Terrain.prototype.toggleMarker = function () {
		this.lightEntity.lightComponent.hidden = !this.lightEntity.lightComponent.hidden;
	};

	Terrain.prototype.setMarker = function (type, size, x, y, power, brushTexture) {
		this.lightEntity.lightComponent.light.shadowSettings.size = size * 0.5;
		brushTexture.wrapS = 'EdgeClamp';
		brushTexture.wrapT = 'EdgeClamp';
		this.lightEntity.lightComponent.light.lightCookie = brushTexture;
		this.lightEntity.setTranslation(x, 200, y);
	};

	Terrain.prototype.pick = function (camera, x, y, store) {
		var entities = [];
		this.terrainRoot.traverse(function (entity) {
			if (entity.meshDataComponent && entity.meshRendererComponent.hidden === false) {
				entities.push(entity);
			}
		});

		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];

			clipmap.clipmapEntity.traverse(function (entity) {
				if (entity.meshRendererComponent) {
					entity.meshRendererComponent.isPickable = true;
					entity.meshRendererComponent.materials[0] = clipmap.terrainPickingMaterial;
				}
			});
		}

		this.renderer.renderToPick(entities, Renderer.mainCamera, true, false, false, x, y, null, true);
		var pickStore = {};
		this.renderer.pick(x, y, pickStore, Renderer.mainCamera);
		camera.getWorldPosition(x, y, this.renderer.viewportWidth, this.renderer.viewportHeight, pickStore.depth, store);

		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];

			clipmap.clipmapEntity.traverse(function (entity) {
				if (entity.meshRendererComponent) {
					entity.meshRendererComponent.isPickable = false;
					entity.meshRendererComponent.materials[0] = clipmap.origMaterial;
				}
			});
		}
	};

	Terrain.prototype.draw = function (mode, type, size, x, y, z, power, brushTexture, rgba) {
		power = MathUtils.clamp(power, 0, 1);

		x = (x - this.size / 2) * 2;
		z = (z - this.size / 2) * 2;

		if (mode === 'paint') {
			this.renderable.materials[0] = this.drawMaterial2;
			this.renderable.materials[0].uniforms.opacity = power;

			if (type === 'add') {
				this.renderable.materials[0].blendState.blendEquationColor = 'AddEquation';
				this.renderable.materials[0].blendState.blendEquationAlpha = 'AddEquation';
			} else if (type === 'sub') {
				this.renderable.materials[0].blendState.blendEquationColor = 'ReverseSubtractEquation';
				this.renderable.materials[0].blendState.blendEquationAlpha = 'ReverseSubtractEquation';
			}

			if (brushTexture) {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
			} else {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
			}

			this.renderable.transform.translation.setDirect(x / this.size, z / this.size, 0);
			this.renderable.transform.scale.setDirect(-size, size, size);
			this.renderable.transform.update();

			this.copyPass.render(this.renderer, this.splatCopy, this.splat);

			this.renderable.materials[0].uniforms.rgba = rgba || [1, 1, 1, 1];
			this.renderer.render(this.renderable, FullscreenUtils.camera, [], this.splat, false);
		} else if (mode === 'smooth') {
			this.renderable.materials[0] = this.drawMaterial3;
			this.renderable.materials[0].uniforms.opacity = power;

			if (brushTexture) {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
			} else {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
			}

			this.renderable.transform.translation.setDirect(x / this.size, z / this.size, 0);
			this.renderable.transform.scale.setDirect(-size, size, size);
			this.renderable.transform.update();

			this.copyPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);

			this.renderer.render(this.renderable, FullscreenUtils.camera, [], this.textures[0], false);
		} else if (mode === 'flatten') {
			this.renderable.materials[0] = this.drawMaterial4;
			this.renderable.materials[0].uniforms.opacity = power;
			this.renderable.materials[0].uniforms.height = y;

			if (brushTexture) {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
			} else {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
			}

			this.renderable.transform.translation.setDirect(x / this.size, z / this.size, 0);
			this.renderable.transform.scale.setDirect(-size, size, size);
			this.renderable.transform.update();

			this.copyPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);

			this.renderer.render(this.renderable, FullscreenUtils.camera, [], this.textures[0], false);
		} else {
			this.renderable.materials[0] = this.drawMaterial1;
			this.renderable.materials[0].uniforms.opacity = power;

			if (type === 'add') {
				this.renderable.materials[0].blendState.blending = 'AdditiveBlending';
			} else if (type === 'sub') {
				this.renderable.materials[0].blendState.blending = 'SubtractiveBlending';
			} else if (type === 'mul') {
				this.renderable.materials[0].blendState.blending = 'MultiplyBlending';
			}

			if (brushTexture) {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
			} else {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
			}

			this.renderable.transform.translation.setDirect(x / this.size, z / this.size, 0);
			this.renderable.transform.scale.setDirect(-size, size, size);
			this.renderable.transform.update();

			this.renderer.render(this.renderable, FullscreenUtils.camera, [], this.textures[0], false);
		}
	};

	Terrain.prototype.getTerrainData = function () {
		var terrainBuffer = new Uint8Array(this.size * this.size * 4);
		this.extractFloatPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);
		this.renderer.readPixels(0, 0, this.size, this.size, terrainBuffer);
		var terrainFloats = new Float32Array(terrainBuffer.buffer);

		var normalBuffer = new Uint8Array(this.size * this.size * 4);
		this.normalmapPass.render(this.renderer, this.normalMap, this.textures[0]);
		this.renderer.readPixels(0, 0, this.size, this.size, normalBuffer);

		var splatBuffer = new Uint8Array(this.size * this.size * 4 * 4);
		this.copyPass.render(this.renderer, this.splatCopy, this.splat);
		this.renderer.readPixels(0, 0, this.size * this.splatMult, this.size * this.splatMult, splatBuffer);

		return {
			heights: terrainFloats,
			normals: normalBuffer,
			splat: splatBuffer
		};
	};

	Terrain.prototype.updateAmmoBody = function () {
		var heights = this.getTerrainData().heights;
		var heightBuffer = this.heightBuffer;
		for (var z = 0; z < this.size; z++) {
			for (var x = 0; x < this.size; x++) {
				Ammo.setValue(heightBuffer + (z * this.size + x) * 4, heights[(this.size - z - 1) * this.size + x], 'float');
			}
		}
	};

	Terrain.prototype.setLightmapTexture = function (lightMap) {
		// update all meshes.
		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];
			clipmap.clipmapEntity.traverse(function (entity) {
				if (entity.meshRendererComponent) {
					var material = entity.meshRendererComponent.materials[0];
					if (lightMap) {
						material.setTexture('LIGHT_MAP', lightMap);
						material.shader.setDefine('LIGHTMAP', true);
					} else {
						material.shader.removeDefine('LIGHTMAP');
					}
				}
			});
		}
	};

	// Returns the ammo body.
	Terrain.prototype.initAmmoBody = function () {
		var heightBuffer = this.heightBuffer = Ammo.allocate(4 * this.size * this.size, 'float', Ammo.ALLOC_NORMAL);

		this.updateAmmoBody();

		var heightScale = 1.0;
		var minHeight = -500;
		var maxHeight = 500;
		var upAxis = 1; // 0 => x, 1 => y, 2 => z
		var heightDataType = 0; //PHY_FLOAT;
		var flipQuadEdges = false;

		var shape = new Ammo.btHeightfieldTerrainShape(
			this.size,
			this.size,
			heightBuffer,
			heightScale,
			minHeight,
			maxHeight,
			upAxis,
			heightDataType,
			flipQuadEdges
		);

		// var sx = xw / widthPoints;
		// var sz = zw / lengthPoints;
		// var sy = 1.0;

		// var sizeVector = new Ammo.btVector3(sx, sy, sz);
		// shape.setLocalScaling(sizeVector);

		var ammoTransform = new Ammo.btTransform();
		ammoTransform.setIdentity(); // TODO: is this needed ?
		ammoTransform.setOrigin(new Ammo.btVector3( this.size / 2, 0, this.size / 2 ));
		var motionState = new Ammo.btDefaultMotionState( ammoTransform );
		var localInertia = new Ammo.btVector3(0, 0, 0);

		var mass = 0;

		var info = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
		var body = new Ammo.btRigidBody(info);
		body.setFriction(1);

		this.world.getSystem('AmmoSystem').ammoWorld.addRigidBody(body);

		return body;
	};

	Terrain.prototype.updateTextures = function () {
		for (var i = 0; i < this.count - 1; i++) {
			var mipmap = this.textures[i];
			var child = this.textures[i + 1];

			mipmap.magFilter = 'Bilinear';
			mipmap.minFilter = 'BilinearNoMipMaps';

			this.copyPass.render(this.renderer, child, mipmap);
		}

		var size = this.size;
		for (var i = 0; i < this.count; i++) {
			var mipmapTarget = this.texturesBounce[i];
			var mipmap = this.textures[i];
			var child = this.textures[i + 1];

			this.upsamplePass.material.setTexture('MAIN_MAP', mipmap);
			this.upsamplePass.material.uniforms.res =  [size, size, 2/size, 2/size];

			if (child) {
				child.magFilter = 'NearestNeighbor';
				child.minFilter = 'NearestNeighborNoMipMaps';

				this.upsamplePass.render(this.renderer, mipmapTarget, child);
			} else {
				mipmap.magFilter = 'NearestNeighbor';
				mipmap.minFilter = 'NearestNeighborNoMipMaps';

				this.upsamplePass.render(this.renderer, mipmapTarget, mipmap);
			}

			size *= 0.5;
		}

		for (var i = 0; i < this.count; i++) {
			this.copyPass.render(this.renderer, this.textures[i], this.texturesBounce[i]);
		}

		this.normalmapPass.render(this.renderer, this.normalMap, this.textures[0]);

		// this.detailmapPass.render(this.renderer, this.detailMap, this.textures[0]);
	};

	Terrain.prototype.update = function (pos) {
		var x = pos.x;
		var y = pos.y;
		var z = pos.z;

		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];

			var xx = Math.floor(x * 0.5 / clipmap.size);
			var yy = Math.floor(y * 0.5 / clipmap.size);
			var zz = Math.floor(z * 0.5 / clipmap.size);

			if (yy !== clipmap.currentY) {
				clipmap.currentY = yy;
				var compSize = this.gridSize * clipmap.size * 2;
				if (clipmap.clipmapEntity._hidden === false && y > compSize) {
					clipmap.clipmapEntity.hide();

					if (i < this.clipmaps.length - 1) {
						var childClipmap = this.clipmaps[i + 1];
						childClipmap.clipmapEntity.innermost.meshRendererComponent.hidden = false;
						childClipmap.clipmapEntity.interior1.meshRendererComponent.hidden = true;
						childClipmap.clipmapEntity.interior2.meshRendererComponent.hidden = true;
					}

					continue;
				} else if (clipmap.clipmapEntity._hidden === true && y <= compSize) {
					clipmap.clipmapEntity.show();

					if (i < this.clipmaps.length - 1) {
						var childClipmap = this.clipmaps[i + 1];
						childClipmap.clipmapEntity.innermost.meshRendererComponent.hidden = true;
						childClipmap.clipmapEntity.interior1.meshRendererComponent.hidden = false;
						childClipmap.clipmapEntity.interior2.meshRendererComponent.hidden = false;
					}
				}
			}

			if (xx === clipmap.currentX && zz === clipmap.currentZ) {
				continue;
			}

			var n = this.n;

			if (clipmap.parentClipmap) {
				var interior1 = clipmap.parentClipmap.clipmapEntity.interior1;
				var interior2 = clipmap.parentClipmap.clipmapEntity.interior2;

				var xxx = MathUtils.moduloPositive(xx + 1, 2);
				var zzz = MathUtils.moduloPositive(zz + 1, 2);
				var xmove = xxx % 2 === 0 ? -n : n + 1;
				var zmove = zzz % 2 === 0 ? -n : n + 1;
				interior1.setTranslation(-n, 0, zmove);
				zzz = MathUtils.moduloPositive(zz, 2);
				zmove = zzz % 2 === 0 ? -n : -n + 1;
				interior2.setTranslation(xmove, 0, zmove);
			}

			clipmap.clipmapEntity.setTranslation(xx * clipmap.size * 2, 0, zz * clipmap.size * 2);

			clipmap.currentX = xx;
			clipmap.currentZ = zz;
		}
	};

	Terrain.prototype.createClipmapLevel = function (world, material, level) {
		var entity = world.createEntity('clipmap' + level);
		entity.addToWorld();

		var n = this.n;

		// 0
		this.createQuadEntity(world, material, level, entity, -2 * n, -2 * n, n, n);
		this.createQuadEntity(world, material, level, entity, -1 * n, -2 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 0 * n, -2 * n, 2, n);
		this.createQuadEntity(world, material, level, entity, 2, -2 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, -2 * n, n, n);

		// 1
		this.createQuadEntity(world, material, level, entity, -2 * n, -1 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, -1 * n, n, n);

		// 2
		this.createQuadEntity(world, material, level, entity, -2 * n, 0, n, 2);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 0, n, 2);

		// 3
		this.createQuadEntity(world, material, level, entity, -2 * n, 2, n, n);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 2, n, n);

		// 4
		this.createQuadEntity(world, material, level, entity, -2 * n, 2 + 1 * n, n, n);
		this.createQuadEntity(world, material, level, entity, -1 * n, 2 + 1 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 0, 2 + 1 * n, 2, n);
		this.createQuadEntity(world, material, level, entity, 2, 2 + 1 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 2 + 1 * n, n, n);

		entity.innermost = this.createQuadEntity(world, material, level, entity, -n, -n, n * 2 + 2, n * 2 + 2);

		if (level !== 0) {
			entity.innermost.meshRendererComponent.hidden = true;

			// interior
			entity.interior1 = this.createQuadEntity(world, material, level, entity, -n, -n, n * 2 + 2, 1);
			entity.interior2 = this.createQuadEntity(world, material, level, entity, -n, -n, 1, n * 2 + 1);
		}

		return entity;
	};

	Terrain.prototype.createQuadEntity = function (world, material, level, parentEntity, x, y, w, h) {
		var meshData = this.createGrid(w, h);
		var entity = world.createEntity('mesh_' + w + '_' + h, meshData, material);

		entity.meshDataComponent.modelBound.xExtent = w * 0.5;
		entity.meshDataComponent.modelBound.yExtent = 255;
		entity.meshDataComponent.modelBound.zExtent = h * 0.5;
		entity.meshDataComponent.modelBound.center.setDirect(w * 0.5, 128, h * 0.5);
		entity.meshDataComponent.autoCompute = false;
		entity.meshRendererComponent.isPickable = false;

		entity.setTranslation(x, 0, y);
		// entity.setTranslation(x * 1.05, 0, y * 1.05);

		parentEntity.attachChild(entity);
		entity.addToWorld();

		return entity;
	};


	Terrain.prototype.createGrid = function (w, h) {
		var key = w + '_' + h;
		if (this._gridCache[key]) {
			return this._gridCache[key];
		}

		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		var meshData = new MeshData(attributeMap, (w + 1) * (h + 1), (w * 2 + 4) * h);
		this._gridCache[key] = meshData;

		meshData.indexModes = ['TriangleStrip'];

		var vertices = meshData.getAttributeBuffer(MeshData.POSITION);
		var indices = meshData.getIndexBuffer();

		for (var x = 0; x < w + 1; x++) {
			for (var y = 0; y < h + 1; y++) {
				var index = y * (w + 1) + x;
				vertices[index * 3 + 0] = x;
				vertices[index * 3 + 1] = 0;
				vertices[index * 3 + 2] = y;
			}
		}

		var indicesIndex = 0;
		var index = 0;
		for (var y = 0; y < h; y++) {
			indices[indicesIndex++] = y * (w + 1);
			indices[indicesIndex++] = y * (w + 1);

			for (var x = 0; x < w; x++) {
				index = y * (w + 1) + x;
				indices[indicesIndex++] = index + w + 1;
				indices[indicesIndex++] = index + 1;
			}

			indices[indicesIndex++] = index + w + 1 + 1;
			indices[indicesIndex++] = index + w + 1 + 1;
		}

		console.log((w + 1) * (h + 1), (w * 2 + 4) * h, w * h * 6);

		return meshData;
	};

	var terrainShaderDefFloat = {
		defines: {
			SKIP_SPECULAR: true
		},
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
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			heightMap: 'HEIGHT_MAP',
			normalMap: 'NORMAL_MAP',
			detailMap: 'DETAIL_MAP',
			splatMap: 'SPLAT_MAP',
			groundMap1: 'GROUND_MAP1',
			groundMap2: 'GROUND_MAP2',
			groundMap3: 'GROUND_MAP3',
			groundMap4: 'GROUND_MAP4',
			groundMap5: 'GROUND_MAP5',
			stoneMap: 'STONE_MAP',
			lightMap: 'LIGHT_MAP',
			fogSettings: function () {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function () {
				return ShaderBuilder.FOG_COLOR;
			},
			resolution: [255, 1, 1024, 1024],
			resolutionNorm: [1024, 1024],
			col: [0, 0, 0]
		},
		builder: function (shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function () {
			return [
				'attribute vec3 vertexPosition;',

				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',
				'uniform vec3 cameraPosition;',
				'uniform sampler2D heightMap;',
				'uniform vec4 resolution;',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec4 alphaval;',

				ShaderBuilder.light.prevertex,

				'const vec2 alphaOffset = vec2(45.0);',
				'const vec2 oneOverWidth = vec2(1.0 / 16.0);',

				'void main(void) {',
				'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
				'vec2 coord = (worldPos.xz + vec2(0.5, 0.5)) / resolution.zw;',

				'vec4 heightCol = texture2D(heightMap, coord);',
				'float zf = heightCol.r;',
				'float zd = heightCol.g;',

				'vec2 alpha = clamp((abs(worldPos.xz - cameraPosition.xz) * resolution.y - alphaOffset) * oneOverWidth, vec2(0.0), vec2(1.0));',
				'alpha.x = max(alpha.x, alpha.y);',
				'float z = mix(zf, zd, alpha.x);',
				'z = coord.x <= 0.0 || coord.x >= 1.0 || coord.y <= 0.0 || coord.y >= 1.0 ? -2000.0 : z;',
				'alphaval = vec4(zf, zd, alpha.x, z);',

				'worldPos.y = z * resolution.x;',
				'gl_Position = viewProjectionMatrix * worldPos;',

				'vWorldPos = worldPos.xyz;',
				'viewPosition = cameraPosition - vWorldPos;',

				ShaderBuilder.light.vertex,
				'}'
			].join('\n');
		},
		fshader: function () {
			return [
				'uniform vec3 col;',
				'uniform sampler2D normalMap;',
				'uniform sampler2D splatMap;',
				'uniform sampler2D detailMap;',
				'uniform sampler2D groundMap1;',
				'uniform sampler2D groundMap2;',
				'uniform sampler2D groundMap3;',
				'uniform sampler2D groundMap4;',
				'uniform sampler2D groundMap5;',
				'uniform sampler2D stoneMap;',
				'uniform sampler2D lightMap;',

				'uniform vec2 fogSettings;',
				'uniform vec3 fogColor;',

				'uniform vec2 resolutionNorm;',

				// 'uniform vec2 resolution;',
				// 'uniform sampler2D heightMap;',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec4 alphaval;',

				ShaderBuilder.light.prefragment,

				'void main(void) {',
					'if (alphaval.w < -1000.0) discard;',
					'vec2 mapcoord = vWorldPos.xz / resolutionNorm;',
					'vec2 coord = mapcoord * 96.0;',
					'vec4 final_color = vec4(1.0);',

					'vec3 N = (texture2D(normalMap, mapcoord).xyz * vec3(2.0) - vec3(1.0)).xzy;',
					'N.y = 0.1;',
					'N = normalize(N);',

					'vec4 splat = texture2D(splatMap, mapcoord);',
					'vec4 g1 = texture2D(groundMap1, coord);',
					'vec4 g2 = texture2D(groundMap2, coord);',
					'vec4 g3 = texture2D(groundMap3, coord);',
					'vec4 g4 = texture2D(groundMap4, coord);',
					'vec4 g5 = texture2D(groundMap5, coord);',
					'vec4 stone = texture2D(stoneMap, coord);',

					'final_color = mix(g1, g2, splat.r);',
					'final_color = mix(final_color, g3, splat.g);',
					'final_color = mix(final_color, g4, splat.b);',
					'final_color = mix(final_color, g5, splat.a);',

					'float slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
					'slope = smoothstep(0.15, 0.25, slope);',
					'final_color = mix(final_color, stone, slope);',

					// 'vec3 detail = texture2D(detailMap, mapcoord).xyz;',
					// 'final_color.rgb = mix(final_color.rgb, detail, smoothstep(30.0, 60.0, length(viewPosition)));',

					'#ifdef LIGHTMAP',
					'final_color = final_color * texture2D(lightMap, mapcoord);',
					'#else',
					ShaderBuilder.light.fragment,
					'#endif',

					'#ifdef FOG',
					'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
					'final_color.rgb = mix(final_color.rgb, fogColor, d);',
					'#endif',

					'gl_FragColor = final_color;',
				'}'
			].join('\n');
		}
	};

	var upsampleShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			diffuseMap: 'MAIN_MAP',
			childMap: Shader.DIFFUSE_MAP,
			res: [1, 1, 1, 1]
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'varying vec2 texCoord0;',

			'void main(void) {',
			'	texCoord0 = vertexUV0;',
			'	gl_Position = vec4(vertexPosition, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D diffuseMap;',
			'uniform sampler2D childMap;',

			'uniform vec4 res;',

			'varying vec2 texCoord0;',

			'void main(void)',
			'{',
			'	gl_FragColor = texture2D(diffuseMap, texCoord0);',

			'	vec2 coordMod = mod(floor(texCoord0 * res.xy), 2.0);',
			'	bvec2 test = equal(coordMod, vec2(0.0));',

			'	if (all(test)) {',
			'		gl_FragColor.g = texture2D(childMap, texCoord0).r;',
			'	} else if (test.x) {',
			'		gl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(0.0, res.w)).r) * 0.5;',
			'	} else if (test.y) {',
			'		gl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(res.z, 0.0)).r) * 0.5;',
			'	} else {',
			'		gl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(res.z, res.w)).r) * 0.5;',
			'	}',
			'	gl_FragColor.ba = vec2(0.0);',
			'}'
		].join('\n')
	};

	var brushShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			opacity: 1.0,
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'	texCoord0 = vertexUV0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader: [
		'uniform sampler2D diffuseMap;',
		'uniform float opacity;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	gl_FragColor = texture2D(diffuseMap, texCoord0);',
		'	gl_FragColor.a *= opacity;',
		'}'//
		].join('\n')
	};

	var brushShader2 = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			opacity: 1.0,
			rgba: [1, 1, 1, 1],
			diffuseMap: Shader.DIFFUSE_MAP,
			splatMap: 'SPLAT_MAP'
		},
		vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',
		'varying vec2 texCoord1;',

		'void main(void) {',
		'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
		'	gl_Position = viewProjectionMatrix * worldPos;',
		'	texCoord0 = vertexUV0;',
		'	texCoord1 = worldPos.xy * 0.5 + 0.5;',
		'}'//
		].join('\n'),
		fshader: [
		'uniform sampler2D diffuseMap;',
		'uniform sampler2D splatMap;',
		'uniform vec4 rgba;',
		'uniform float opacity;',

		'varying vec2 texCoord0;',
		'varying vec2 texCoord1;',

		'void main(void)',
		'{',
		'	vec4 splat = texture2D(splatMap, texCoord1);',
		'	vec4 brush = texture2D(diffuseMap, texCoord0);',
		'	vec4 final = mix(splat, rgba, opacity * length(brush.rgb) * brush.a);',
		'	gl_FragColor = final;',
		'}'//
		].join('\n')
	};

	var brushShader3 = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			opacity: 1.0,
			size: 1/512,
			diffuseMap: Shader.DIFFUSE_MAP,
			heightMap: 'HEIGHT_MAP'
		},
		vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',
		'varying vec2 texCoord1;',

		'void main(void) {',
		'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
		'	gl_Position = viewProjectionMatrix * worldPos;',
		'	texCoord0 = vertexUV0;',
		'	texCoord1 = worldPos.xy * 0.5 + 0.5;',
		'}'//
		].join('\n'),
		fshader: [
		'uniform sampler2D diffuseMap;',
		'uniform sampler2D heightMap;',
		'uniform float opacity;',

		'uniform float size;',

		'varying vec2 texCoord0;',
		'varying vec2 texCoord1;',

		'void main(void)',
		'{',
		'	float col1 = texture2D(heightMap, texCoord1 + vec2(-size, -size)).r;',
		'	float col2 = texture2D(heightMap, texCoord1 + vec2(-size, size)).r;',
		'	float col3 = texture2D(heightMap, texCoord1 + vec2(size, size)).r;',
		'	float col4 = texture2D(heightMap, texCoord1 + vec2(size, -size)).r;',
		'	float avg = (col1 + col2 + col3 + col4) * 0.25;',
		'	gl_FragColor = texture2D(heightMap, texCoord1);',
		'	vec4 brush = texture2D(diffuseMap, texCoord0);',
		'	gl_FragColor.r = mix(gl_FragColor.r, avg, brush.r * brush.a * opacity);',
		'}'//
		].join('\n')
	};

	var brushShader4 = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			opacity: 1.0,
			height: 0,
			diffuseMap: Shader.DIFFUSE_MAP,
			heightMap: 'HEIGHT_MAP'
		},
		vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',
		'varying vec2 texCoord1;',

		'void main(void) {',
		'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
		'	gl_Position = viewProjectionMatrix * worldPos;',
		'	texCoord0 = vertexUV0;',
		'	texCoord1 = worldPos.xy * 0.5 + 0.5;',
		'}'//
		].join('\n'),
		fshader: [
		'uniform sampler2D diffuseMap;',
		'uniform sampler2D heightMap;',
		'uniform float opacity;',

		'uniform float height;',

		'varying vec2 texCoord0;',
		'varying vec2 texCoord1;',

		'void main(void)',
		'{',
		'	gl_FragColor = texture2D(heightMap, texCoord1);',
		'	vec4 brush = texture2D(diffuseMap, texCoord0);',
		'	gl_FragColor.r = mix(gl_FragColor.r, height, brush.r * brush.a * opacity);',
		'}'//
		].join('\n')
	};

	var extractShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'	texCoord0 = vertexUV0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader: [
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',

		'float shift_right (float v, float amt) {',
			'v = floor(v) + 0.5;',
			'return floor(v / exp2(amt));',
		'}',
		'float shift_left (float v, float amt) {',
			'return floor(v * exp2(amt) + 0.5);',
		'}',
		'float mask_last (float v, float bits) {',
			'return mod(v, shift_left(1.0, bits));',
		'}',
		'float extract_bits (float num, float from, float to) {',
			'from = floor(from + 0.5); to = floor(to + 0.5);',
			'return mask_last(shift_right(num, from), to - from);',
		'}',
		'vec4 encode_float (float val) {',
			'if (val == 0.0) return vec4(0, 0, 0, 0);',
			'float sign = val > 0.0 ? 0.0 : 1.0;',
			'val = abs(val);',
			'float exponent = floor(log2(val));',
			'float biased_exponent = exponent + 127.0;',
			'float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;',
			'float t = biased_exponent / 2.0;',
			'float last_bit_of_biased_exponent = fract(t) * 2.0;',
			'float remaining_bits_of_biased_exponent = floor(t);',
			'float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;',
			'float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;',
			'float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;',
			'float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;',
			'return vec4(byte4, byte3, byte2, byte1);',
		'}',

		'void main(void)',
		'{',
		// '	gl_FragColor = encode_float(texture2D(diffuseMap, texCoord0).r);',
		'	gl_FragColor = encode_float(texture2D(diffuseMap, vec2(texCoord0.x, 1.0 - texCoord0.y)).r);',
		'}'//
		].join('\n')
	};

	var terrainPickingShader = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraFar: Shader.FAR_PLANE,
			cameraPosition: Shader.CAMERA,
			heightMap: 'HEIGHT_MAP',
			resolution: [255, 1, 1, 1],
			id: function (shaderInfo) {
				return shaderInfo.renderable.id + 1;
			}
		},
		vshader: [
		'attribute vec3 vertexPosition;',

		'uniform sampler2D heightMap;',
		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform float cameraFar;',
		'uniform vec4 resolution;',
		'uniform vec3 cameraPosition;',

		'varying float depth;',

		'const vec2 alphaOffset = vec2(45.0);',
		'const vec2 oneOverWidth = vec2(1.0 / 16.0);',

		'void main(void) {',
			'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'vec2 coord = (worldPos.xz + vec2(0.5, 0.5)) / resolution.zw;',

			'vec4 heightCol = texture2D(heightMap, coord);',
			'float zf = heightCol.r;',
			'float zd = heightCol.g;',

			'vec2 alpha = clamp((abs(worldPos.xz - cameraPosition.xz) * resolution.y - alphaOffset) * oneOverWidth, vec2(0.0), vec2(1.0));',
			'alpha.x = max(alpha.x, alpha.y);',
			'float z = mix(zf, zd, alpha.x);',
			// 'depth = z;',

			'worldPos.y = z * resolution.x;',

			'vec4 mvPosition = viewMatrix * worldPos;',
			'depth = -mvPosition.z / cameraFar;',
			'gl_Position = projectionMatrix * mvPosition;',
		'}'
		].join('\n'),
		fshader: [
		'uniform float id;',

		'varying float depth;',

		ShaderFragment.methods.packDepth16,

		'void main() {',
			'vec2 packedId = vec2(floor(id/255.0), mod(id, 255.0)) * vec2(1.0/255.0);',
			'vec2 packedDepth = packDepth16(depth);',
			'gl_FragColor = vec4(packedId, packedDepth);',
			// 'gl_FragColor = vec4(depth * 0.2, 0.0, 0.0, 1.0);',
		'}'
		].join('\n')
	};

	// var detailShader = {
	// 	attributes: {
	// 		vertexPosition: MeshData.POSITION,
	// 		vertexUV0: MeshData.TEXCOORD0
	// 	},
	// 	uniforms: {
	// 		viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
	// 		worldMatrix: Shader.WORLD_MATRIX,
	// 		normalMap: 'NORMAL_MAP',
	// 		splatMap: 'SPLAT_MAP',
	// 		groundMap1: 'GROUND_MAP1',
	// 		groundMap2: 'GROUND_MAP2',
	// 		groundMap3: 'GROUND_MAP3',
	// 		groundMap4: 'GROUND_MAP4',
	// 		groundMap5: 'GROUND_MAP5',
	// 		stoneMap: 'STONE_MAP'
	// 	},
	// 	vshader: [
	// 		'attribute vec3 vertexPosition;',
	// 		'attribute vec2 vertexUV0;',

	// 		'varying vec2 texCoord0;',

	// 		'void main(void) {',
	// 		'	texCoord0 = vertexUV0;',
	// 		'	gl_Position = vec4(vertexPosition, 1.0);',
	// 		'}'
	// 	].join('\n'),
	// 	fshader: [
	// 		'uniform sampler2D normalMap;',
	// 		'uniform sampler2D splatMap;',
	// 		'uniform sampler2D groundMap1;',
	// 		'uniform sampler2D groundMap2;',
	// 		'uniform sampler2D groundMap3;',
	// 		'uniform sampler2D groundMap4;',
	// 		'uniform sampler2D groundMap5;',
	// 		'uniform sampler2D stoneMap;',

	// 		'varying vec2 texCoord0;',

	// 		'void main(void) {',
	// 			'vec4 final_color = vec4(1.0);',

	// 			'vec2 coord = texCoord0 * 96.0;',

	// 			'vec3 N = (texture2D(normalMap, texCoord0).xyz * vec3(2.0) - vec3(1.0)).xzy;',
	// 			'N.y = 0.1;',
	// 			'N = normalize(N);',

	// 			'vec4 splat = texture2D(splatMap, texCoord0);',
	// 			'vec4 g1 = texture2D(groundMap1, coord);',
	// 			'vec4 g2 = texture2D(groundMap2, coord);',
	// 			'vec4 g3 = texture2D(groundMap3, coord);',
	// 			'vec4 g4 = texture2D(groundMap4, coord);',
	// 			'vec4 g5 = texture2D(groundMap5, coord);',
	// 			'vec4 stone = texture2D(stoneMap, coord);',

	// 			'final_color = mix(g1, g2, splat.r);',
	// 			'final_color = mix(final_color, g3, splat.g);',
	// 			'final_color = mix(final_color, g4, splat.b);',
	// 			'final_color = mix(final_color, g5, splat.a);',

	// 			'float slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
	// 			'slope = smoothstep(0.15, 0.25, slope);',
	// 			'final_color = mix(final_color, stone, slope);',

	// 			'gl_FragColor = final_color;',
	// 		'}'
	// 	].join('\n')
	// };

	var normalmapShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			heightMap: Shader.DIFFUSE_MAP,
			// normalMap: Shader.NORMAL_MAP,
			resolution: [512, 512],
			height	: 0.05
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 vUv;',
			'void main() {',
				'vUv = vertexUV0;',
				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
			'}'
		].join('\n'),
		fshader: [
			'uniform float height;',
			'uniform vec2 resolution;',
			'uniform sampler2D heightMap;',
			// 'uniform sampler2D normalMap;',

			'varying vec2 vUv;',

			'void main() {',
				'float val = texture2D(heightMap, vUv).x;',
				'float valU = texture2D(heightMap, vUv + vec2(1.0 / resolution.x, 0.0)).x;',
				'float valV = texture2D(heightMap, vUv + vec2(0.0, 1.0 / resolution.y)).x;',

				'vec3 normal = vec3(val - valU, val - valV, height);',
				// 'normal.rgb += vec3(texture2D(normalMap, vUv).rg * 2.0 - 1.0, 0.0);',
				'gl_FragColor = vec4((0.5 * normalize(normal) + 0.5), 1.0);',
			'}'
		].join('\n')
	};

	module.exports = Terrain;

/***/ },

/***/ 505:
/***/ function(module, exports, __webpack_require__) {

	var Terrain = __webpack_require__(504);
	var Vegetation = __webpack_require__(506);
	var Forrest = __webpack_require__(503);
	var Vector3 = __webpack_require__(8);
	var Ajax = __webpack_require__(132);
	var MathUtils = __webpack_require__(9);
	var Texture = __webpack_require__(53);
	var TextureCreator = __webpack_require__(125);
	var RSVP = __webpack_require__(55);

	function TerrainHandler(goo, terrainSize, clipmapLevels, resourceFolder) {
		this.goo = goo;
		this.terrainSize = terrainSize;
		this.resourceFolder = resourceFolder;
		this.terrain = new Terrain(goo, this.terrainSize, clipmapLevels);
		this.vegetation = new Vegetation();
		this.forrest = new Forrest();

		this.hidden = false;
		this.store = new Vector3();
		this.settings = null;
		this.pick = true;
		this.draw = false;
		this.eventX = 0;
		this.eventY = 0;
		this.vegetationSettings = {
			gridSize: 7
		};
	}

	TerrainHandler.prototype.isEditing = function () {
		return !this.hidden;
	};

	TerrainHandler.prototype.getHeightAt = function (pos) {
		return this.terrainQuery ? this.terrainQuery.getHeightAt(pos) : 0;
	};

	TerrainHandler.prototype.isEditing = function () {
		return !this.hidden;
	};

	TerrainHandler.prototype.getHeightAt = function (pos) {
		return this.terrainQuery ? this.terrainQuery.getHeightAt(pos) : 0;
	};

	var LMB = false;
	var altKey = false;

	var mousedown = function (e) {
		if (e.button === 0) {
			this.eventX = e.clientX;
			this.eventY = e.clientY;

			LMB = true;
			altKey = e.altKey;

			this.pick = true;
			this.draw = true;
			console.log('mousedown');
		}
	};

	var mouseup = function (e) {
		if (e.button === 0) {
			LMB = false;
			this.draw = false;
			console.log('mouseup');
		}
	};

	var mousemove = function (e) {
		this.eventX = e.clientX;
		this.eventY = e.clientY;

		this.pick = true;

		if (LMB) {
			altKey = e.altKey;
			this.draw = true;
		}
	};

	TerrainHandler.prototype.toggleEditMode = function () {
		this.terrain.toggleMarker();

		this.hidden = !this.hidden;

		if (this.hidden) {
			this.goo.renderer.domElement.addEventListener('mousedown', mousedown.bind(this), false);
			this.goo.renderer.domElement.addEventListener('mouseup', mouseup.bind(this), false);
			this.goo.renderer.domElement.addEventListener('mouseout', mouseup.bind(this), false);
			this.goo.renderer.domElement.addEventListener('mousemove', mousemove.bind(this), false);
		} else {
			this.goo.renderer.domElement.removeEventListener('mousedown', mousedown);
			this.goo.renderer.domElement.removeEventListener('mouseup', mouseup);
			this.goo.renderer.domElement.removeEventListener('mouseout', mouseup);
			this.goo.renderer.domElement.removeEventListener('mousemove', mousemove);
			this.terrainInfo = this.terrain.getTerrainData();
			this.draw = false;
			LMB = false;
		}

		this.forrest.toggle();
		this.vegetation.toggle();
	};

	TerrainHandler.prototype.initLevel = function (terrainData, settings, forrestLODEntityMap) {
		this.settings = settings;
		var terrainSize = this.terrainSize;

		var terrainPromise = this._loadData(terrainData.heightMap);
		var splatPromise = this._loadData(terrainData.splatMap);

		return RSVP.all([terrainPromise, splatPromise]).then(function (datas) {
			var terrainBuffer = datas[0];
			var splatBuffer = datas[1];

			var terrainArray;
			if (terrainBuffer) {
				terrainArray = new Float32Array(terrainBuffer);
			} else {
				terrainArray = new Float32Array(terrainSize * terrainSize);
			}

			var splatArray;
			if (splatBuffer) {
				splatArray = new Uint8Array(splatBuffer);
			} else {
				splatArray = new Uint8Array(terrainSize * terrainSize * 4 * 4);
			}

			return this._load(terrainData, terrainArray, splatArray, forrestLODEntityMap);
		}.bind(this));
	};

	TerrainHandler.prototype._loadData = function (url) {
		var promise = new RSVP.Promise();

		var ajax = new Ajax();
		ajax.get({
			url: this.resourceFolder + url,
			responseType: 'arraybuffer'
		}).then(function (request) {
			promise.resolve(request.response);
		}.bind(this), function () {
			promise.resolve(null);
		}.bind(this));

		return promise;
	};

	TerrainHandler.prototype._textureLoad = function (url) {
		return new TextureCreator().loadTexture2D(url, {
			anisotropy: 4
		});
	};

	TerrainHandler.prototype._load = function (terrainData, parentMipmap, splatMap, forrestLODEntityMap) {
		var promises = [];
		promises.push(this._textureLoad(this.resourceFolder + terrainData.ground1.texture));
		promises.push(this._textureLoad(this.resourceFolder + terrainData.ground2.texture));
		promises.push(this._textureLoad(this.resourceFolder + terrainData.ground3.texture));
		promises.push(this._textureLoad(this.resourceFolder + terrainData.ground4.texture));
		promises.push(this._textureLoad(this.resourceFolder + terrainData.ground5.texture));
		promises.push(this._textureLoad(this.resourceFolder + terrainData.stone.texture));
		return RSVP.all(promises).then(function (textures) {
			this.terrain.init({
				heightMap: parentMipmap,
				splatMap: splatMap,
				ground1: textures[0],
				ground2: textures[1],
				ground3: textures[2],
				ground4: textures[3],
				ground5: textures[4],
				stone: textures[5]
			});
			this.terrainInfo = this.terrain.getTerrainData();

			var terrainSize = this.terrainSize;
			var calcVec = new Vector3();

			var terrainQuery = this.terrainQuery = {
				getHeightAt: function (pos) {
					if (pos[0] < 0 || pos[0] > terrainSize - 1 || pos[2] < 0 || pos[2] > terrainSize - 1) {
						return -1000;
					}

					var x = pos[0];
					var z = terrainSize - pos[2];

					var col = Math.floor(x);
					var row = Math.floor(z);

					var intOnX = x - col,
						intOnZ = z - row;

					var col1 = col + 1;
					var row1 = row + 1;

					col = MathUtils.moduloPositive(col, terrainSize);
					row = MathUtils.moduloPositive(row, terrainSize);
					col1 = MathUtils.moduloPositive(col1, terrainSize);
					row1 = MathUtils.moduloPositive(row1, terrainSize);

					var topLeft = this.terrainInfo.heights[row * terrainSize + col];
					var topRight = this.terrainInfo.heights[row * terrainSize + col1];
					var bottomLeft = this.terrainInfo.heights[row1 * terrainSize + col];
					var bottomRight = this.terrainInfo.heights[row1 * terrainSize + col1];

					return MathUtils.lerp(intOnZ, MathUtils.lerp(intOnX, topLeft, topRight),
						MathUtils.lerp(intOnX, bottomLeft, bottomRight));
				}.bind(this),
				getNormalAt: function (pos) {
					var x = pos[0];
					var z = terrainSize - pos[2];

					var col = Math.floor(x);
					var row = Math.floor(z);

					var col1 = col + 1;
					var row1 = row + 1;

					col = MathUtils.moduloPositive(col, terrainSize);
					row = MathUtils.moduloPositive(row, terrainSize);
					col1 = MathUtils.moduloPositive(col1, terrainSize);
					row1 = MathUtils.moduloPositive(row1, terrainSize);

					var topLeft = this.terrainInfo.heights[row * terrainSize + col];
					var topRight = this.terrainInfo.heights[row * terrainSize + col1];
					var bottomLeft = this.terrainInfo.heights[row1 * terrainSize + col];

					return calcVec.setDirect((topLeft - topRight), 1, (bottomLeft - topLeft)).normalize();
				}.bind(this),
				getVegetationType: function (xx, zz, slope) {
					var rand = Math.random();
					if (MathUtils.smoothstep(0.82, 0.91, slope) < rand) {
						return null;
					}

					if (this.terrainInfo) {
						xx = Math.floor(xx);
						zz = Math.floor(zz);

						if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
							return null;
						}

						xx *= this.terrain.splatMult;
						zz *= this.terrain.splatMult;

						var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
						var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
						var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
						var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
						var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
						var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;

						var test = 0;
						for (var veg in type.vegetation) {
							test += type.vegetation[veg];
							if (rand < test) {
								return veg;
							}
						}
						return null;
					}
					return null;
				}.bind(this),
				getForrestType: function (xx, zz, slope, rand) {
					if (MathUtils.smoothstep(0.8, 0.88, slope) < rand) {
						return null;
					}

					if (this.terrainInfo) {
						xx = Math.floor(xx);
						zz = Math.floor(zz);

						if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
							return null;
						}

						xx *= this.terrain.splatMult;
						zz *= this.terrain.splatMult;

						var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
						var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
						var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
						var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
						var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
						var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;

						var test = 0;
						for (var veg in type.forrest) {
							test += type.forrest[veg];
							if (rand < test) {
								return veg;
							}
						}
						return null;
					}
					return null;
				}.bind(this),
				getLightAt: function (pos) {
					if (pos[0] < 0 || pos[0] > terrainSize - 1 || pos[2] < 0 || pos[2] > terrainSize - 1) {
						return -1000;
					}

					if (!this.lightMapData || !this.lightMapSize) {
						return 1;
					}

					var x = pos[0] * this.lightMapSize / terrainSize;
					var z = (terrainSize - pos[2]) * this.lightMapSize / terrainSize;

					var col = Math.floor(x);
					var row = Math.floor(z);

					var intOnX = x - col;
					var intOnZ = z - row;

					var col1 = col + 1;
					var row1 = row + 1;

					col = MathUtils.moduloPositive(col, this.lightMapSize);
					row = MathUtils.moduloPositive(row, this.lightMapSize);
					col1 = MathUtils.moduloPositive(col1, this.lightMapSize);
					row1 = MathUtils.moduloPositive(row1, this.lightMapSize);

					var topLeft = this.lightMapData[row * this.lightMapSize + col];
					var topRight = this.lightMapData[row * this.lightMapSize + col1];
					var bottomLeft = this.lightMapData[row1 * this.lightMapSize + col];
					var bottomRight = this.lightMapData[row1 * this.lightMapSize + col1];

					return MathUtils.lerp(intOnZ, MathUtils.lerp(intOnX, topLeft, topRight),
							MathUtils.lerp(intOnX, bottomLeft, bottomRight)) / 255.0;
				}.bind(this),

				getType: function (xx, zz, slope, rand) {
					if (MathUtils.smoothstep(0.8, 0.88, slope) < rand) {
						return terrainData.stone;
					}

					if (this.terrainInfo) {
						xx = Math.floor(xx);
						zz = Math.floor(zz);

						if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
							return terrainData.stone;
						}

						xx *= this.terrain.splatMult;
						zz *= this.terrain.splatMult;

						var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
						var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
						var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
						var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
						var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
						var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;

						return type;
					}
					return terrainData.stone;
				}.bind(this)
			};

			return new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.vegetationAtlas).then(function (vegetationAtlasTexture) {

				vegetationAtlasTexture.anisotropy = 4;
				var vegetationTypes = terrainData.vegetationTypes;

				return new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.forrestAtlas).then(function (forrestAtlasTexture) {

					forrestAtlasTexture.anisotropy = 4;

					return new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.forrestAtlasNormals).then(function (forrestAtlasNormals) {

						var forrestTypes = terrainData.forrestTypes;

						this.vegetation.init(this.goo.world, terrainQuery, vegetationAtlasTexture, vegetationTypes, this.vegetationSettings);
						this.forrest.init(this.goo.world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, forrestLODEntityMap);

					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	TerrainHandler.prototype.updatePhysics = function () {
		this.terrain.updateAmmoBody();
	};

	TerrainHandler.prototype.initPhysics = function () {
		this.ammoBody = this.terrain.initAmmoBody();
	};

	TerrainHandler.prototype.useLightmap = function (data, size) {
		if (data) {
			var lightMap = new Texture(data, {
				magFilter: 'Bilinear',
				minFilter: 'NearestNeighborNoMipMaps',
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp',
				generateMipmaps: false,
				format: 'Luminance',
				type: 'UnsignedByte'
			}, size, size);

			this.lightMapData = data;
			this.lightMapSize = size;
			this.terrain.setLightmapTexture(lightMap);
		} else {
			delete this.lightMapData;
			delete this.lightMapSize;
			this.terrain.setLightmapTexture();
		}
	};

	TerrainHandler.prototype.useLightmap = function (data, size) {
		if (data) {
			var lightMap = new Texture(data, {
				magFilter: 'Bilinear',
				minFilter: 'NearestNeighborNoMipMaps',
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp',
				generateMipmaps: false,
				format: 'Luminance',
				type: 'UnsignedByte'
			}, size, size);

			this.lightMapData = data;
			this.lightMapSize = size;
			this.terrain.setLightmapTexture(lightMap);
		} else {
			delete this.lightMapData;
			delete this.lightMapSize;
			this.terrain.setLightmapTexture();
		}
	};

	TerrainHandler.prototype.update = function (cameraEntity) {
		var pos = cameraEntity.cameraComponent.camera.translation;

		if (this.terrain) {
			var settings = this.settings;

			if (this.hidden && this.pick) {
				this.terrain.pick(cameraEntity.cameraComponent.camera, this.eventX, this.eventY, this.store);
				this.terrain.setMarker('add', settings.size, this.store.x, this.store.z, settings.power, settings.brushTexture);
				this.pick = false;
			}

			if (this.hidden && this.draw) {
				var type = 'add';
				if (altKey) {
					type = 'sub';
				}

				var rgba = [0, 0, 0, 0];
				if (settings.rgba === 'ground2') {
					rgba = [1, 0, 0, 0];
				} else if (settings.rgba === 'ground3') {
					rgba = [0, 1, 0, 0];
				} else if (settings.rgba === 'ground4') {
					rgba = [0, 0, 1, 0];
				} else if (settings.rgba === 'ground5') {
					rgba = [0, 0, 0, 1];
				}

				this.terrain.draw(settings.mode, type, settings.size, this.store.x, this.store.y, this.store.z,
					settings.power * this.goo.world.tpf * 60 / 100, settings.brushTexture, rgba);
				this.terrain.updateTextures();
			}

			this.terrain.update(pos);
		}
		if (this.vegetation) {
			this.vegetation.update(pos.x, pos.z);
		}
		if (this.forrest) {
			this.forrest.update(pos.x, pos.z);
		}
	};

	module.exports = TerrainHandler;


/***/ },

/***/ 506:
/***/ function(module, exports, __webpack_require__) {

	var MeshDataComponent = __webpack_require__(215);
	var Material = __webpack_require__(30);
	var MathUtils = __webpack_require__(9);
	var Vector3 = __webpack_require__(8);
	var Transform = __webpack_require__(41);
	var MeshData = __webpack_require__(14);
	var Shader = __webpack_require__(31);
	var MeshBuilder = __webpack_require__(112);
	var Quad = __webpack_require__(28);
	var ShaderBuilder = __webpack_require__(48);

	function Vegetation() {
		this.calcVec = new Vector3();
		this.initDone = false;
	}

	Vegetation.prototype.init = function (world, terrainQuery, vegetationAtlasTexture, vegetationTypes, settings) {
		this.world = world;
		this.terrainQuery = terrainQuery;

		this.vegetationList = {};
		for (var type in vegetationTypes) {
			var typeSettings = vegetationTypes[type];
			var meshData = this.createBase(typeSettings);
			this.vegetationList[type] = meshData;
		}

		var material = new Material(vegetationShader, 'vegetation');
		material.setTexture('DIFFUSE_MAP', vegetationAtlasTexture);
		material.cullState.enabled = false;
		material.uniforms.discardThreshold = 0.2;
		material.blendState.blending = 'CustomBlending';
		// material.uniforms.materialAmbient = [0.3, 0.3, 0.3, 0.3];
		material.uniforms.materialAmbient = [0, 0, 0, 0];
		material.uniforms.materialDiffuse = [1, 1, 1, 1];
		material.uniforms.materialSpecular = [0, 0, 0, 0];
		material.renderQueue = 3001;
		this.material = material;

		this.patchSize = 15;
		this.patchDensity = 19;
		this.gridSize = 7;

		if (settings) {
			this.patchSize = settings.patchSize || this.patchSize;
			this.patchDensity = settings.patchDensity || this.patchDensity;
			this.gridSize = settings.gridSize || this.gridSize;
		}

		this.patchSpacing = this.patchSize / this.patchDensity;
		this.gridSizeHalf = Math.floor(this.gridSize * 0.5);
		this.grid = [];
		var dummyMesh = this.createPatch(0, 0);
		for (var x = 0; x < this.gridSize; x++) {
			this.grid[x] = [];
			for (var z = 0; z < this.gridSize; z++) {
				var entity = this.world.createEntity(this.material);
				var meshDataComponent = new MeshDataComponent(dummyMesh);
				meshDataComponent.modelBound.xExtent = this.patchSize;
				meshDataComponent.modelBound.yExtent = 500;
				meshDataComponent.modelBound.zExtent = this.patchSize;
				meshDataComponent.autoCompute = false;
				entity.set(meshDataComponent);
				entity.addToWorld();
				this.grid[x][z] = entity;
				entity.meshRendererComponent.cullMode = 'Never';
				entity.meshRendererComponent.hidden = true;
			}
		}

		material.uniforms.fadeDistMax = this.gridSizeHalf * this.patchSize;
		material.uniforms.fadeDistMin = 0.70 * material.uniforms.fadeDistMax;

		this.currentX = -10000;
		this.currentZ = -10000;

		this.initDone = true;
	};

	Vegetation.prototype.rebuild = function () {
		this.currentX = -10000;
		this.currentZ = -10000;
	};

	var hidden = false;
	Vegetation.prototype.toggle = function () {
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

	Vegetation.prototype.update = function (x, z) {
		if (!this.initDone || hidden) {
			return;
		}

		var newX = Math.floor(x / this.patchSize);
		var newZ = Math.floor(z / this.patchSize);

		if (this.currentX === newX && this.currentZ === newZ) {
			return;
		}

		// console.time('vegetation update');

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
				var meshData = this.createPatch(patchX, patchZ);
				if (!meshData) {
					entity.meshRendererComponent.hidden = true;
				} else {
					entity.meshRendererComponent.hidden = false;
					entity.meshDataComponent.meshData = meshData;
					entity.meshRendererComponent.worldBound.center.setDirect(patchX + this.patchSize * 0.5, 0, patchZ + this.patchSize * 0.5);
				}
			}
		}

		this.currentX = newX;
		this.currentZ = newZ;

		// console.timeEnd('vegetation update');
	};

	Vegetation.prototype.createPatch = function (patchX, patchZ) {
		var meshBuilder = new MeshBuilder();
		var transform = new Transform();

		var patchDensity = this.patchDensity;
		var patchSpacing = this.patchSpacing;
		var pos = [0, 10, 0];
		for (var x = 0; x < patchDensity; x++) {
			for (var z = 0; z < patchDensity; z++) {
				var xx = patchX + (x + Math.random() * 0.5) * patchSpacing;
				var zz = patchZ + (z + Math.random() * 0.5) * patchSpacing;
				pos[0] = xx;
				pos[2] = zz + 0.5;
				var yy = this.terrainQuery.getHeightAt(pos);
				var norm = this.terrainQuery.getNormalAt(pos);
				if (yy === null) {
					yy = 0;
				}
				if (norm === null) {
					norm = Vector3.UNIT_Y;
				}
				var slope = norm.dot(Vector3.UNIT_Y);

				var vegetationType = this.terrainQuery.getVegetationType(xx, zz, slope);
				if (!vegetationType) {
					continue;
				}

				var size = Math.random() * 0.4 + 0.8;
				transform.scale.setDirect(size, size, size);
				transform.translation.setDirect(0, 0, 0);
				var angle = Math.random() * Math.PI * 2.0;
				var anglex = Math.sin(angle);
				var anglez = Math.cos(angle);
				this.calcVec.setDirect(anglex, 0.0, anglez);
				// norm.y = 0.5;
				// norm.normalize();
				this.lookAt(transform.rotation, this.calcVec, norm);
				transform.translation.setDirect(xx, yy, zz);
				transform.update();

				var meshData = this.vegetationList[vegetationType];
				meshBuilder.addMeshData(meshData, transform);

				// console.count('grass');
			}
		}
		var meshDatas = meshBuilder.build();

		// Calculate lighting from lightmap
		for (var i = 0; i<meshDatas.length; i++) {
			var meshData = meshDatas[i];
			var verts = meshData.getAttributeBuffer(MeshData.POSITION);
			var cols = meshData.getAttributeBuffer(MeshData.COLOR);
			for (var i = 0, j = 0; i < verts.length; i += 3, j += 4) {
				var col = this.terrainQuery.getLightAt([verts[i], verts[i + 1], verts[i + 2]]);
				cols[j] = col;
				cols[j + 1] = col;
				cols[j + 2] = col;
				cols[j + 3] = 1;
			}
		}

		return meshDatas[0]; // Don't create patches bigger than 65k
	};

	var _tempX = new Vector3();
	var _tempY = new Vector3();
	var _tempZ = new Vector3();

	Vegetation.prototype.lookAt = function (matrix, direction, up) {
		var x = _tempX, y = _tempY, z = _tempZ;

		y.set(up).normalize();
		x.set(up).cross(direction).normalize();
		z.set(y).cross(x);

		var d = matrix.data;
		d[0] = x.x;
		d[1] = x.y;
		d[2] = x.z;
		d[3] = y.x;
		d[4] = y.y;
		d[5] = y.z;
		d[6] = z.x;
		d[7] = z.y;
		d[8] = z.z;

		return this;
	};

	Vegetation.prototype.createBase = function (type) {
		var meshData = new Quad(type.w, type.h, 10, 10);
		meshData.attributeMap.BASE = MeshData.createAttribute(1, 'Float');
		meshData.attributeMap.COLOR = MeshData.createAttribute(4, 'Float');

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

		meshData.getAttributeBuffer(MeshData.COLOR).set([
			1, 1, 1, 1,
			1, 1, 1, 1,
			1, 1, 1, 1,
			1, 1, 1, 1
		]);

		var meshBuilder = new MeshBuilder();
		var transform = new Transform();
		transform.translation.y = type.h * 0.5 - type.h * 0.1;
		transform.translation.z = -type.w * 0.1;
		transform.update();

		meshBuilder.addMeshData(meshData, transform);

		// transform.setRotationXYZ(0, Math.PI * 0.5, 0);
		transform.setRotationXYZ(0, Math.PI * 0.3, 0);
		transform.translation.x = type.w * 0.1;
		transform.translation.z = type.w * 0.1;
		transform.update();

		meshBuilder.addMeshData(meshData, transform);

		transform.setRotationXYZ(0, -Math.PI * 0.3, 0);
		transform.translation.x = -type.w * 0.1;
		transform.translation.z = type.w * 0.1;
		transform.update();

		meshBuilder.addMeshData(meshData, transform);

		var meshDatas = meshBuilder.build();

		return meshDatas[0];
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
			vertexNormal: MeshData.NORMAL,
			vertexUV0: MeshData.TEXCOORD0,
			vertexColor: MeshData.COLOR,
			base: 'BASE'
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			diffuseMap: Shader.DIFFUSE_MAP,
			discardThreshold: -0.01,
			fogSettings: function () {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function () {
				return ShaderBuilder.FOG_COLOR;
			},
			time: Shader.TIME,
			fadeDistMin: 40.0,
			fadeDistMax: 50.0
		},
		builder: function (shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function () {
			return [
				'attribute vec3 vertexPosition;',
				'attribute vec3 vertexNormal;',
				'attribute vec2 vertexUV0;',
				'attribute vec4 vertexColor;',
				'attribute float base;',

				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',
				'uniform vec3 cameraPosition;',
				'uniform float time;',
				'uniform float fadeDistMin;',
				'uniform float fadeDistMax;',

				ShaderBuilder.light.prevertex,

				'varying vec3 normal;',
				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec2 texCoord0;',
				'varying vec4 color;',
				'varying float dist;',

				'void main(void) {',
					'vec3 swayPos = vertexPosition;',
					'swayPos.x += sin(time * 1.0 + swayPos.x * 0.5) * base * sin(time * 1.8 + swayPos.y * 0.6) * 0.1 + 0.08;',
					'vec4 worldPos = worldMatrix * vec4(swayPos, 1.0);',
					'vWorldPos = worldPos.xyz;',
					'gl_Position = viewProjectionMatrix * worldPos;',

					ShaderBuilder.light.vertex,

					'normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
					'texCoord0 = vertexUV0;',
					'color = vertexColor;',
					'viewPosition = cameraPosition - worldPos.xyz;',
					'dist = 1.0 - smoothstep(fadeDistMin, fadeDistMax, length(viewPosition.xz));',
				'}'
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
				'varying vec4 color;',

				'void main(void)',
				'{',
					'vec4 final_color = texture2D(diffuseMap, texCoord0) * color;',
					'if (final_color.a < discardThreshold) discard;',
					'final_color.a = min(final_color.a, dist);',
					'if (final_color.a <= 0.0) discard;',

					'vec3 N = normalize(normal);',

					ShaderBuilder.light.fragment,

					'final_color.a = pow(final_color.a, 0.5);',

					'#ifdef FOG',
					'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
					'final_color.rgb = mix(final_color.rgb, fogColor, d);',
					'#endif',

					'gl_FragColor = final_color;',
				'}'
			].join('\n');
		}
	};

	module.exports = Vegetation;

/***/ },

/***/ 507:
/***/ function(module, exports, __webpack_require__) {

	var MeshData = __webpack_require__(14);
	var MathUtils = __webpack_require__(9);

	/**
	 * A grid-like surface shape
	 * @param {array} heightMatrix The height data by x and z axis.
	 * @param {number} xWidth x axis size in units
	 * @param {number} yHeight y axis size in units
	 * @param {number} zWidth z axis size in units
	 */
	function TerrainSurface(heightMatrix, xWidth, yHeight, zWidth) {
	    var verts = [];
	    for (var i = 0; i < heightMatrix.length; i++) {
	        for (var j = 0; j < heightMatrix[i].length; j++) {
	            verts.push(i * xWidth / (heightMatrix.length-1), heightMatrix[i][j]*yHeight, j * zWidth / (heightMatrix.length-1));
	        }
	    }
		this.verts = verts;
		this.vertsPerLine = heightMatrix[0].length;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);

		var nVerts = this.verts.length / 3;
		var nLines = nVerts / this.vertsPerLine;
		MeshData.call(this, attributeMap, nVerts, (nLines - 1) * (this.vertsPerLine - 1) * 6);

		this.rebuild();
	}

	TerrainSurface.prototype = Object.create(MeshData.prototype);

	/**
	 * Builds or rebuilds the mesh data
	 * @returns {Surface} Self for chaining
	 */
	TerrainSurface.prototype.rebuild = function () {
		this.getAttributeBuffer(MeshData.POSITION).set(this.verts);

		var indices = [];

		var norms = [];
		var normals = [];

		var nVerts = this.verts.length / 3;
		var nLines = nVerts / this.vertsPerLine;

		for (var i = 0; i < nLines - 1; i++) {
			for (var j = 0; j < this.vertsPerLine - 1; j++) {
				var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
				var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
				var downRight = (i + 1) * this.vertsPerLine + (j + 1);
				var upRight = (i + 0) * this.vertsPerLine + (j + 1);

				indices.push(downLeft, upLeft, upRight, downLeft, upRight, downRight);

				normals = MathUtils.getTriangleNormal(
					this.verts[upLeft * 3 + 0],
					this.verts[upLeft * 3 + 1],
					this.verts[upLeft * 3 + 2],

	                this.verts[upRight * 3 + 0],
	                this.verts[upRight * 3 + 1],
	                this.verts[upRight * 3 + 2],

					this.verts[downLeft * 3 + 0],
					this.verts[downLeft * 3 + 1],
					this.verts[downLeft * 3 + 2]


	            );

				norms.push(normals[0], normals[1], normals[2]);
			}
			norms.push(normals[0], normals[1], normals[2]);
		}

		i--;
		for (var j = 0; j < this.vertsPerLine - 1; j++) {
			var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
			var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
			var upRight = (i + 0) * this.vertsPerLine + (j + 1);

			normals = MathUtils.getTriangleNormal(
				this.verts[upLeft * 3 + 0],
				this.verts[upLeft * 3 + 1],
				this.verts[upLeft * 3 + 2],

	            this.verts[upRight * 3 + 0],
	            this.verts[upRight * 3 + 1],
	            this.verts[upRight * 3 + 2],

				this.verts[downLeft * 3 + 0],
				this.verts[downLeft * 3 + 1],
				this.verts[downLeft * 3 + 2]
	        );


			norms.push(normals[0], normals[1], normals[2]);
		}

		norms.push(normals[0], normals[1], normals[2]);

		this.getAttributeBuffer(MeshData.NORMAL).set(norms);
		this.getIndexBuffer().set(indices);

		// compute texture coordinates
		var tex = [];

	    var maxX = this.verts[this.verts.length-3];
	    var maxZ = this.verts[this.verts.length-1];
		for (var i = 0; i < this.verts.length; i += 3) {
			var x = (this.verts[i + 0]) / maxX;
			var z = (this.verts[i + 2]) / maxZ;
			tex.push(x, z);
		}

		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

		return this;
	};

	module.exports = TerrainSurface;


/***/ }

});

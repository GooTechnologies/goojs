define([
	'goo/entities/EntityUtils',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/MathUtils',
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/TextureCreator',
	'goo/renderer/Texture',
	'goo/renderer/Renderer',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/light/DirectionalLight'
], function(
	EntityUtils,
	MeshDataComponent,
	MeshRendererComponent,
	MathUtils,
	Transform,
	Vector3,
	MeshData,
	Material,
	Shader,
	ShaderBuilder,
	ShaderLib,
	ShaderFragment,
	TextureCreator,
	Texture,
	Renderer,
	FullscreenPass,
	FullscreenUtil,
	DirectionalLight
) {
	'use strict';

	var Ammo = window.Ammo; // make jslint happy

	/**
	 * A TerrainStatic
	 */
	function TerrainStatic(goo, size, count) {
		this.world = goo.world;
		this.renderer = goo.renderer;
		this.size = size;
		this.count = count;
		this.splatMult = 2;

		this._gridCache = {};

		this.textureData = [];
		this.textures = [];
		this.texturesBounce = [];
		for (var i = 0; i < count; i++) {
			this.textureData[i] = new Float32Array(size * size * 4);
			this.texturesBounce[i] = new Texture(new Float32Array(size * size * 4), {
				magFilter: 'NearestNeighbor',
				minFilter: 'NearestNeighborNoMipMaps',
				wrapS: 'Repeat',
				wrapT: 'Repeat',
				generateMipmaps: false,
				type: 'Float'
			}, size, size);
			this.textures[i] = new Texture(this.textureData[i], {
				magFilter: 'NearestNeighbor',
				minFilter: 'NearestNeighborNoMipMaps',
				wrapS: 'Repeat',
				wrapT: 'Repeat',
				generateMipmaps: false,
				type: 'Float'
			}, size, size);

			size *= 0.5;
		}

		this.n = 31;
		this.gridSize = (this.n + 1) * 4 - 1;
		console.log('grid size: ', this.gridSize);
	}
	
	TerrainStatic.prototype.cleanup = function () {
		// clean all textures!
		// for (var name in this.terrainTextures) {
		// 	var texture = this.terrainTextures[name];
		// 	if (texture instanceof Texture) {
		// 		this.renderer._deallocateTexture(texture);
		// 	}
		// }
		// this.terrainTextures = null;

		// this.renderer._deallocateRenderTarget(this.normalMap);
		// this.renderer._deallocateRenderTarget(this.outputTarget);
		// this.renderer._deallocateRenderTarget(this.splat);
		// this.renderer._deallocateRenderTarget(this.splatCopy);

		this.terrainRoot.removeFromWorld();
	};

	TerrainStatic.prototype.init = function(terrainTextures) {
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

		this.floatTexture = terrainTextures.heightMap instanceof Texture ? terrainTextures.heightMap : new Texture(terrainTextures.heightMap, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps',
			wrapS: 'Repeat',
			wrapT: 'Repeat',
			generateMipmaps: false,
			format: 'Luminance'
		}, this.size, this.size);

		this.splatTexture = terrainTextures.splatMap instanceof Texture ? terrainTextures.splatMap : new Texture(terrainTextures.splatMap, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps',
			wrapS: 'Repeat',
			wrapT: 'Repeat',
			generateMipmaps: false,
			flipY: false
		}, this.size * this.splatMult, this.size * this.splatMult);

		for (var i = 0; i < this.count; i++) {
			var material = this.clipmaps[i].origMaterial;
			var texture = this.textures[i];

			material.setTexture('HEIGHT_MAP', texture);
			material.setTexture('NORMAL_MAP', terrainTextures.normalMap);
			if (terrainTextures.lightMap) {
				material.setTexture('LIGHT_MAP', terrainTextures.lightMap);
				material.shader.setDefine('LIGHTMAP', true);
			}

			material.setTexture('SPLAT_MAP', terrainTextures.attributesMap);
			material.setTexture('GROUND_MAP1', terrainTextures.ground1);
			material.setTexture('GROUND_MAP2', terrainTextures.ground2);
			material.setTexture('GROUND_MAP3', terrainTextures.ground3);
			material.setTexture('GROUND_MAP4', terrainTextures.ground4);
			material.setTexture('GROUND_MAP5', terrainTextures.ground5);
			material.setTexture('STONE_MAP', terrainTextures.stone);

			var terrainPickingMaterial = this.clipmaps[i].terrainPickingMaterial;
			terrainPickingMaterial.setTexture('HEIGHT_MAP', texture);
		}

		this.copySingle(this.textures[0], this.floatTexture);

		this.updateTextures();
	};

	TerrainStatic.prototype.copySingle = function(to, from) {
		console.log(from, to);
		var fromData = from.image.data;
		var toData = to.image.data;
		for (var x = 0; x < from._originalWidth; x++) {
			for (var y = 0; y < from._originalHeight; y++) {
				toData[(y * to._originalWidth + x) * 4 + 0] = fromData[(y * from._originalWidth + x)];
			}
		}
	};

	TerrainStatic.prototype.copy = function(to, from) {
		console.log(from, to);
		var fromData = from.image.data;
		var toData = to.image.data;
		for (var x = 0; x < from._originalWidth; x++) {
			for (var y = 0; y < from._originalHeight; y++) {
				toData[(y * to._originalWidth + x) * 4 + 0] = fromData[(y * from._originalWidth + x) * 4 + 0];
				toData[(y * to._originalWidth + x) * 4 + 1] = fromData[(y * from._originalWidth + x) * 4 + 1];
			}
		}
	};

	TerrainStatic.prototype.downSample = function(to, from) {
		console.log(from, to);
		var fromData = from.image.data;
		var toData = to.image.data;
		for (var x = 0; x < to._originalWidth; x++) {
			for (var y = 0; y < to._originalHeight; y++) {
				var fromIndex = (y * 2) * from._originalWidth + (x * 2);
				var toIndex = y * to._originalWidth + x;
				toData[toIndex * 4 + 0] = (
					fromData[(fromIndex) * 4] +
					fromData[(fromIndex+1) * 4] * 1 +
					fromData[(fromIndex+from._originalWidth) * 4] * 1 +
					fromData[(fromIndex+from._originalWidth+1) * 4] * 1
				) / 4;
			}
		}
	};

	TerrainStatic.prototype.upSample = function(to, from) {
		console.log(from, to);
		var fromData = from.image.data;
		var toData = to.image.data;
		for (var x = 0; x < to._originalWidth; x++) {
			for (var y = 0; y < to._originalHeight; y++) {
				var offsetX = (x % 2 === 0) ? 0 : 1;
				var offsetY = (y % 2 === 0) ? -1 : 0;

				var xx = Math.floor(x / 2);
				var yy = Math.floor(y / 2);

				var fromIndex1 = (yy * from._originalWidth + xx);
				var fromIndex2 = (MathUtils.moduloPositive(yy + offsetY, from._originalHeight) * from._originalWidth +
					MathUtils.moduloPositive(xx + offsetX, from._originalWidth));
				var toIndex = y * to._originalWidth + x;

				toData[toIndex * 4 + 1] = (fromData[fromIndex1 * 4 + 0] + fromData[fromIndex2 * 4 + 0]) / 2;
			}
		}
	};

	TerrainStatic.prototype.getTerrainData = function() {
		// var terrainBuffer = new Uint8Array(this.size * this.size * 4);
		// this.extractFloatPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);
		// this.renderer.readPixels(0, 0, this.size, this.size, terrainBuffer);
		var terrainFloats = new Float32Array(this.size * this.size);
		for (var i = 0; i < this.size * this.size; i++) {
			terrainFloats[i] = this.textures[0].image.data[i * 4];
		}

		var normalBuffer = new Uint8Array(this.size * this.size * 4);
		// this.normalmapPass.render(this.renderer, this.normalMap, this.textures[0]);
		// this.renderer.readPixels(0, 0, this.size, this.size, normalBuffer);

		var splatBuffer = new Uint8Array(this.size * this.size * 4 * this.splatMult * this.splatMult);
		// this.copyPass.render(this.renderer, this.splatCopy, this.splat);
		// this.renderer.readPixels(0, 0, this.size * this.splatMult, this.size * this.splatMult, splatBuffer);

		return {
			heights: terrainFloats,
			normals: normalBuffer,
			splat: splatBuffer
		};
	};

	TerrainStatic.prototype.updateAmmoBody = function() {
		var heights = this.getTerrainData().heights;
		var heightBuffer = this.heightBuffer;
		for (var z = 0; z < this.size; z++) {
			for (var x = 0; x < this.size; x++) {
				Ammo.setValue(heightBuffer + (z * this.size + x) * 4, heights[(this.size - z - 1) * this.size + x], 'float');
			}
		}
	};

	TerrainStatic.prototype.setLightmapTexture = function(lightMap) {
		// update all meshes.
		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];
			clipmap.clipmapEntity.traverse(function(entity) {
				if (entity.meshRendererComponent) {
					var material = entity.meshRendererComponent.materials[0];
					if (lightMap) {
						material.setTexture("LIGHT_MAP", lightMap);
						material.shader.setDefine('LIGHTMAP', true);
					} else {
						material.shader.removeDefine('LIGHTMAP');
					}
				}
			});
		}
	};

	// Returns the ammo body.
	TerrainStatic.prototype.initAmmoBody = function() {
		var heightBuffer = this.heightBuffer = Ammo.allocate(4 * this.size * this.size, "float", Ammo.ALLOC_NORMAL);

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
		ammoTransform.setOrigin(new Ammo.btVector3(this.size / 2, 0, this.size / 2));
		var motionState = new Ammo.btDefaultMotionState(ammoTransform);
		var localInertia = new Ammo.btVector3(0, 0, 0);

		var mass = 0;

		var info = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
		var body = new Ammo.btRigidBody(info);
		body.setFriction(1);

		this.world.getSystem('AmmoSystem').ammoWorld.addRigidBody(body);

		return body;
	};

	TerrainStatic.prototype.updateTextures = function() {
		for (var i = 0; i < this.count - 1; i++) {
			var mipmap = this.textures[i];
			var child = this.textures[i + 1];

			mipmap.magFilter = 'Bilinear';
			mipmap.minFilter = 'BilinearNoMipMaps';

			// this.copyPass.render(this.renderer, child, mipmap);
			this.downSample(child, mipmap);
		}

		var size = this.size;
		for (var i = 0; i < this.count; i++) {
			// var mipmapTarget = this.texturesBounce[i];
			var mipmap = this.textures[i];
			var child = this.textures[i + 1];

			// this.upsamplePass.material.setTexture('MAIN_MAP', mipmap);
			// this.upsamplePass.material.uniforms.res = [size, size, 2 / size, 2 / size];
			mipmap.magFilter = 'NearestNeighbor';
			mipmap.minFilter = 'NearestNeighborNoMipMaps';

			if (child) {
				child.magFilter = 'NearestNeighbor';
				child.minFilter = 'NearestNeighborNoMipMaps';

				// this.upSample(mipmapTarget, child, mipmap);
				this.upSample(mipmap, child);
				// this.upsamplePass.render(this.renderer, mipmapTarget, child);
			} else {
				mipmap.magFilter = 'NearestNeighbor';
				mipmap.minFilter = 'NearestNeighborNoMipMaps';

				// this.upSample(mipmapTarget, mipmap, mipmap);
				// this.upsamplePass.render(this.renderer, mipmapTarget, mipmap);
			}

			size *= 0.5;
		}

		for (var i = 0; i < this.count; i++) {
			// this.copyPass.render(this.renderer, this.textures[i], this.texturesBounce[i]);
			// this.copy(this.textures[i], this.texturesBounce[i]);
			this.textures[i].setNeedsUpdate();
		}

		// this.normalmapPass.render(this.renderer, this.normalMap, this.textures[0]);

		// this.detailmapPass.render(this.renderer, this.detailMap, this.textures[0]);
	};

	TerrainStatic.prototype.update = function(pos) {
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

	TerrainStatic.prototype.createClipmapLevel = function(world, material, level) {
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

	TerrainStatic.prototype.createQuadEntity = function(world, material, level, parentEntity, x, y, w, h) {
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


	TerrainStatic.prototype.createGrid = function(w, h) {
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
			function(shader) {
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
			fogSettings: function() {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function() {
				return ShaderBuilder.FOG_COLOR;
			},
			resolution: [255, 1, 1024, 1024],
			resolutionNorm: [1024, 1024],
			col: [0, 0, 0]
		},
		builder: function(shader, shaderInfo) {
			if (!shader.hasDefine('LIGHTMAP')) {
				ShaderBuilder.light.builder(shader, shaderInfo);
			}
		},
		vshader: function() {
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

				'#ifndef LIGHTMAP',
				ShaderBuilder.light.prevertex,
				'#endif',

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
				'z = coord.x <= 0.0 || coord.x >= 1.0 || coord.y <= 0.0 || coord.y >= 1.0 ? -1000.0 : z;',
				'alphaval = vec4(zf, zd, alpha.x, z);',

				'worldPos.y = z * resolution.x;',
				'gl_Position = viewProjectionMatrix * worldPos;',

				'vWorldPos = worldPos.xyz;',
				'viewPosition = cameraPosition - vWorldPos;',

				'#ifndef LIGHTMAP',
					ShaderBuilder.light.vertex,
				'#endif',
				'}'
			].join('\n');
		},
		fshader: function() {
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

				'#ifndef LIGHTMAP',
				ShaderBuilder.light.prefragment,
				'#endif',

				'void main(void) {',
				'if (alphaval.w <= 0.0) discard;',
				'vec2 mapcoord = vWorldPos.xz / resolutionNorm;',
				'vec2 coord = mapcoord * 96.0;',
				'vec4 final_color = vec4(1.0);',

				// 'vec3 N = (texture2D(normalMap, mapcoord).xyz * vec3(2.0) - vec3(1.0)).xzy;',
				'vec3 N = (texture2D(normalMap, mapcoord).xyz * vec3(2.0) - vec3(1.0)).xyz;',
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

				// 'float slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
				'float slope = clamp(1.0 - dot(N, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);',
				'slope = smoothstep(0.15, 0.25, slope);',
				'final_color = mix(final_color, stone, slope);',

				// 'vec3 detail = texture2D(detailMap, mapcoord).xyz;',
				// 'final_color.rgb = mix(final_color.rgb, detail, smoothstep(30.0, 60.0, length(viewPosition)));',

				'#ifdef LIGHTMAP',
					'final_color = final_color * texture2D(lightMap, mapcoord) * 1.5;',
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
			id: function(shaderInfo) {
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
		].join("\n"),
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
		].join("\n")
	};

	return TerrainStatic;
});
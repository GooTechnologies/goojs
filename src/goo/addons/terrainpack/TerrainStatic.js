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
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/Texture',
	'goo/renderer/Renderer',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/light/DirectionalLight',
	'goo/shapes/Quad'
], function (
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
	RenderTarget,
	Texture,
	Renderer,
	FullscreenPass,
	FullscreenUtil,
	DirectionalLight,
	Quad
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

			size *= 0.5;
		}

		this.n = 31;
		this.gridSize = (this.n + 1) * 4 - 1;
		console.log('grid size: ', this.gridSize);
	}

	TerrainStatic.prototype.init = function (terrainTextures) {
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
		lightEntity.setRotation(-Math.PI*0.5, 0, 0);
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

		// var normalAdd = new TextureCreator().loadTexture2D('res/TerrainStatic/grass2n.jpg', {
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

	TerrainStatic.prototype.toggleMarker = function () {
		this.lightEntity.lightComponent.hidden = !this.lightEntity.lightComponent.hidden;
	};

	TerrainStatic.prototype.setMarker = function (type, size, x, y, power, brushTexture) {
		this.lightEntity.lightComponent.light.shadowSettings.size = size * 0.5;
		brushTexture.wrapS = 'EdgeClamp';
		brushTexture.wrapT = 'EdgeClamp';
		this.lightEntity.lightComponent.light.lightCookie = brushTexture;
		this.lightEntity.setTranslation(x, 200, y);
	};

	TerrainStatic.prototype.pick = function (camera, x, y, store) {
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

	TerrainStatic.prototype.draw = function (mode, type, size, x, y, z, power, brushTexture, rgba) {
		power = MathUtils.clamp(power, 0, 1);

		x = (x - this.size/2) * 2;
		z = (z - this.size/2) * 2;

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

			this.renderable.transform.translation.setDirect(x/this.size, z/this.size, 0);
			this.renderable.transform.scale.setDirect(-size, size, size);
			this.renderable.transform.update();

			this.copyPass.render(this.renderer, this.splatCopy, this.splat);

			this.renderable.materials[0].uniforms.rgba = rgba || [1,1,1,1];
			this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.splat, false);
		} else if (mode === 'smooth') {
			this.renderable.materials[0] = this.drawMaterial3;
			this.renderable.materials[0].uniforms.opacity = power;

			if (brushTexture) {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
			} else {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
			}

			this.renderable.transform.translation.setDirect(x/this.size, z/this.size, 0);
			this.renderable.transform.scale.setDirect(-size, size, size);
			this.renderable.transform.update();

			this.copyPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);

			this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.textures[0], false);
		} else if (mode === 'flatten') {
			this.renderable.materials[0] = this.drawMaterial4;
			this.renderable.materials[0].uniforms.opacity = power;
			this.renderable.materials[0].uniforms.height = y;

			if (brushTexture) {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
			} else {
				this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
			}

			this.renderable.transform.translation.setDirect(x/this.size, z/this.size, 0);
			this.renderable.transform.scale.setDirect(-size, size, size);
			this.renderable.transform.update();

			this.copyPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);

			this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.textures[0], false);
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

			this.renderable.transform.translation.setDirect(x/this.size, z/this.size, 0);
			this.renderable.transform.scale.setDirect(-size, size, size);
			this.renderable.transform.update();

			this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.textures[0], false);
		}
	};

	TerrainStatic.prototype.getTerrainData = function () {
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

	TerrainStatic.prototype.updateAmmoBody = function () {
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
			clipmap.clipmapEntity.traverse(function (entity) {
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
	TerrainStatic.prototype.initAmmoBody = function () {
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

	TerrainStatic.prototype.updateTextures = function () {
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

	TerrainStatic.prototype.update = function (pos) {
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

	TerrainStatic.prototype.createClipmapLevel = function (world, material, level) {
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

	TerrainStatic.prototype.createQuadEntity = function (world, material, level, parentEntity, x, y, w, h) {
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


	TerrainStatic.prototype.createGrid = function (w, h) {
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
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			opacity : 1.0,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
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
		fshader : [//
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
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			opacity : 1.0,
			rgba: [1,1,1,1],
			diffuseMap : Shader.DIFFUSE_MAP,
			splatMap : 'SPLAT_MAP'
		},
		vshader : [
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
		fshader : [//
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
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			opacity : 1.0,
			size: 1/512,
			diffuseMap : Shader.DIFFUSE_MAP,
			heightMap : 'HEIGHT_MAP'
		},
		vshader : [
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
		fshader : [//
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
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			opacity : 1.0,
			height: 0,
			diffuseMap : Shader.DIFFUSE_MAP,
			heightMap : 'HEIGHT_MAP'
		},
		vshader : [
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
		fshader : [//
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
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
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
		fshader : [//
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
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraFar : Shader.FAR_PLANE,
			cameraPosition: Shader.CAMERA,
			heightMap: 'HEIGHT_MAP',
			resolution: [255, 1, 1, 1],
			id : function (shaderInfo) {
				return shaderInfo.renderable.id + 1;
			}
		},
		vshader : [
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
		fshader : [
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
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			heightMap : Shader.DIFFUSE_MAP,
			// normalMap : Shader.NORMAL_MAP,
			resolution : [512, 512],
			height	: 0.05
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform float height;",
			"uniform vec2 resolution;",
			"uniform sampler2D heightMap;",
			// "uniform sampler2D normalMap;",

			"varying vec2 vUv;",

			"void main() {",
				"float val = texture2D(heightMap, vUv).x;",
				"float valU = texture2D(heightMap, vUv + vec2(1.0 / resolution.x, 0.0)).x;",
				"float valV = texture2D(heightMap, vUv + vec2(0.0, 1.0 / resolution.y)).x;",

				'vec3 normal = vec3(val - valU, val - valV, height);',
				// 'normal.rgb += vec3(texture2D(normalMap, vUv).rg * 2.0 - 1.0, 0.0);',
				"gl_FragColor = vec4((0.5 * normalize(normal) + 0.5), 1.0);",
			"}"
		].join("\n")
	};

	return TerrainStatic;
});
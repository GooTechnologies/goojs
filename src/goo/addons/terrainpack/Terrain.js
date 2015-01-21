define([
	'goo/math/MathUtils',
	'goo/math/Transform',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/Texture',
	'goo/renderer/Renderer',
	'goo/renderer/pass/FullscreenPass',
	'goo/shapes/Quad'
],

function(
	MathUtils,
	Transform,
	MeshData,
	Material,
	Shader,
	ShaderBuilder,
	ShaderLib,
	ShaderFragment,
	RenderTarget,
	Texture,
	Renderer,
	FullscreenPass,
	Quad
) {
	'use strict';

	var Ammo = window.Ammo; // make jslint happy

	/**
	 * @class A terrain
	 */
	function Terrain(goo, size, count) {
		this.world = goo.world;
		this.renderer = goo.renderer;
		this.size = size;
		this.dimensions = {
			scale:  32
		};
	//	setHeightScale(this.dimensions.scale);

		//	this.n = Math.floor(31 * this.dimensions.scale);

        	this.n = 31;
        //	this.n = 15;

		this.materialSettings = {
			culling:true
		};

		this.count = count;
		this.splatMult = 2;

		this._gridCache = {};

		this.setupTerrainTextures(size, count);

		this.addBrushMaterials(size, this.texturesBounce[0]);

		this.setupTerrainMaterials(size);
	}

	Terrain.prototype.setupTerrainTextures = function(size, count) {
		this.textures = [];
		this.texturesBounce = [];

		var sizeRenderTarget = function(size) {
			return new RenderTarget(size, size, {
				magFilter: 'NearestNeighbor',
				minFilter: 'NearestNeighborNoMipMaps',
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp',
				generateMipmaps: false,
				type: 'Float'
			})
		};

		for (var i = 0; i < count; i++) {
			this.textures[i] = sizeRenderTarget(size);
			this.texturesBounce[i] = sizeRenderTarget(size);
			size *= 0.5;
		}
	};

	Terrain.prototype.setupTerrainMaterials = function(size) {

		this.terrainMaterials = [];

		this.renderable.transform.setRotationXYZ(0, 0, Math.PI*0.5);

		this.copyPass = new FullscreenPass(ShaderLib.screenCopy);
		this.copyPass.material.depthState.enabled = false;

		this.upsamplePass = new FullscreenPass(upsampleShader);
		this.upsamplePass.material.depthState.enabled = false;

		this.normalmapPass = new FullscreenPass(normalmapShader);
		this.normalmapPass.material.depthState.enabled = false;
		this.normalmapPass.material.uniforms.resolution = [size, size];
		this.normalmapPass.material.uniforms.height = 10;
		this.normalmapPass.material.shader.uniforms.scaleHeightWidth = this.dimensions.scale;

		this.extractFloatPass = new FullscreenPass(extractShader);
		// this.detailmapPass = new FullscreenPass(detailShader);

		this.normalMap = new RenderTarget(size, size);
		// this.detailMap = new RenderTarget(size, size);

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

		this.drawMaterial2.setTexture('SPLAT_MAP', this.splatCopy);

	};

	Terrain.prototype.addBrushMaterials = function(size, txBounce) {
		var brush = new Quad(2 / size, 2 / size);

		this.drawMaterial1 = new Material(brushShader);
		this.drawMaterial1.blendState.blending = 'AdditiveBlending';
		this.drawMaterial1.cullState.cullFace = 'Front';

		this.drawMaterial2 = new Material(brushShader2);
		this.drawMaterial2.cullState.cullFace = 'Front';

		this.drawMaterial3 = new Material(brushShader3);
		this.drawMaterial3.uniforms.size = 1 / size;
		this.drawMaterial3.cullState.cullFace = 'Front';

		this.drawMaterial4 = new Material(brushShader4);
		this.drawMaterial4.cullState.cullFace = 'Front';
		this.drawMaterial1.shader.uniforms.scaleHeightWidth = this.dimensions.scale;
		this.drawMaterial2.shader.uniforms.scaleHeightWidth = this.dimensions.scale;
		this.drawMaterial3.shader.uniforms.scaleHeightWidth = this.dimensions.scale;
		this.drawMaterial4.shader.uniforms.scaleHeightWidth = this.dimensions.scale;

		this.renderable = {
			meshData: brush,
			materials: [this.drawMaterial1],
			transform: new Transform()
		};

		this.drawMaterial3.setTexture('HEIGHT_MAP', txBounce);
		this.drawMaterial4.setTexture('HEIGHT_MAP', txBounce);
	};


	Terrain.prototype.setTerrainScale = function(scale) {
		this.dimensions.scale = scale;
	};

	Terrain.prototype.addClipmap = function(level) {
		var size = Math.pow(2, level);

		var material = new Material(terrainShaderDefFloat, 'clipmap' + level);
		material.uniforms.materialAmbient = [0.0, 0.0, 0.0, 1.0];
		material.uniforms.materialDiffuse = [1.0, 1.0, 1.0, 1.0];
		material.cullState.frontFace = 'CW';
		material.cullState.enabled = this.materialSettings.culling;
		//	console.log("Cull state..", getMaterialPropertyValue('culling'), this.materialSettings)
		// material.wireframe = true;
		material.uniforms.resolution = [1, 1 / size, this.size, this.size];
		material.uniforms.resolutionNorm = [this.size, this.size];
		this.terrainMaterials.push(material);

		//	console.log("Terrain Material: ", material)

		var clipmapEntity = this.createClipmapLevel(this.world, material, level);
		clipmapEntity.setScale(size, 1, size);
		this.terrainRoot.attachChild(clipmapEntity);

		var terrainPickingMaterial = new Material(terrainPickingShader, 'terrainPickingMaterial' + level);
		terrainPickingMaterial.shader.uniforms.scaleHeightWidth = this.dimensions.scale;
		terrainPickingMaterial.cullState.frontFace = 'CW';
		terrainPickingMaterial.uniforms.resolution = [1, 1 / size, this.size, this.size];
		terrainPickingMaterial.blendState = {
			blending: 'NoBlending',
			blendEquation: 'AddEquation',
			blendSrc: 'SrcAlphaFactor',
			blendDst: 'OneMinusSrcAlphaFactor'
		};

		return {
			clipmapEntity: clipmapEntity,
			level: level,
			size: size,
			currentX: 100000,
			currentY: 100000,
			currentZ: 100000,
			origMaterial: material,
			terrainPickingMaterial: terrainPickingMaterial
		};
	};


	Terrain.prototype.addClipmapMaterial = function(clipmap, texture) {
		var material = clipmap.origMaterial;

		material.setTexture('HEIGHT_MAP', texture);
		material.setTexture('NORMAL_MAP', this.normalMap);
		material.setTexture('DETAIL_MAP', this.detailMap);

		material.setTexture('SPLAT_MAP', this.splat);
		material.setTexture('GROUND_MAP1', this.terrainTextures.ground1);
		material.setTexture('GROUND_MAP2', this.terrainTextures.ground2);
		material.setTexture('GROUND_MAP3', this.terrainTextures.ground3);
		material.setTexture('GROUND_MAP4', this.terrainTextures.ground4);
		material.setTexture('GROUND_MAP5', this.terrainTextures.ground5);
		material.setTexture('STONE_MAP', this.terrainTextures.stone);
		var terrainPickingMaterial = clipmap.terrainPickingMaterial;
		terrainPickingMaterial.setTexture('HEIGHT_MAP', texture);
	};

	Terrain.prototype.rebuild = function() {
		this.clipmaps = [];

		for (var i = 0; i < this.count; i++) {
			this.clipmaps[i] = this.addClipmap(i);
			this.addClipmapMaterial(this.clipmaps[i], this.textures[i])
		}

		var parentClipmap = this.clipmaps[this.clipmaps.length - 1];
		for (var i = this.clipmaps.length - 2; i >= 0; i--) {
			var clipmap = this.clipmaps[i];
			clipmap.parentClipmap = parentClipmap;
			parentClipmap = clipmap;
		}

		this.floatTexture = this.terrainTextures.heightMap instanceof Texture ? this.terrainTextures.heightMap : new Texture(this.terrainTextures.heightMap, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps',
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp',
			generateMipmaps: false,
			format: 'Luminance'
		}, this.size, this.size);

		this.splatTexture = this.terrainTextures.splatMap instanceof Texture ? this.terrainTextures.splatMap : new Texture(this.terrainTextures.splatMap, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps',
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp',
			generateMipmaps: false,
			flipY: false
		}, this.size * this.splatMult, this.size * this.splatMult);

		this.copyPass.render(this.renderer, this.textures[0], this.floatTexture);
		this.copyPass.render(this.renderer, this.splatCopy, this.splatTexture);
		this.copyPass.render(this.renderer, this.splat, this.splatTexture);

		this.updateTextures();
		this.setShaderUniform('scaleHeightWidth', this.dimensions.scale)
	};

	Terrain.prototype.init = function (terrainTextures, initDone) {
		this.terrainTextures = terrainTextures;
		this.terrainRoot = this.world.createEntity('TerrainRoot');
		this.terrainRoot.addToWorld();
		this.rebuild();
		if (initDone) initDone();
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
	//	console.log("Pick: ", x, y);
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

	Terrain.prototype.setLightmapTexture = function(lightMap) {
		// update all meshes.
		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];
			clipmap.clipmapEntity.traverse(function (entity) {
				if (entity.meshRendererComponent) {
					var material = entity.meshRendererComponent.materials[0];
					if (lightMap) {
						material.setTexture("LIGHT_MAP", lightMap);
						material.shader.defines.LIGHTMAP = true;
					} else {
						material.shader.defines.LIGHTMAP = false;
					}
				}
			});
		}
	};

	// Returns the ammo body.
	Terrain.prototype.initAmmoBody = function () {
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

		var s = this.dimensions.scale;

		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];

			var xx = Math.floor(x * 0.5 / (clipmap.size*s))*s;
			var yy = Math.floor(y * 0.5 / (clipmap.size*s))*s;
			var zz = Math.floor(z * 0.5 / (clipmap.size*s))*s;

			if (yy !== clipmap.currentY) {
				clipmap.currentY = yy;
				var compSize = this.gridSize * clipmap.size * 2 * s;
				if (clipmap.clipmapEntity._hidden === false && y > compSize) {
					clipmap.clipmapEntity.hide();

					if (i < this.clipmaps.length - 1) {
						var childClipmap = this.clipmaps[i + 1];
						childClipmap.clipmapEntity.innermost.meshRendererComponent.hidden = false;
				//		childClipmap.clipmapEntity.interior1.meshRendererComponent.hidden = true;
				//		childClipmap.clipmapEntity.interior2.meshRendererComponent.hidden = true;
					}

					continue;
				} else if (clipmap.clipmapEntity._hidden === true && y <= compSize) {
					clipmap.clipmapEntity.show();

					if (i < this.clipmaps.length - 1) {
						var childClipmap = this.clipmaps[i + 1];
						childClipmap.clipmapEntity.innermost.meshRendererComponent.hidden = true;
				//		childClipmap.clipmapEntity.interior1.meshRendererComponent.hidden = false;
				//		childClipmap.clipmapEntity.interior2.meshRendererComponent.hidden = false;
					}
				}
			}

			if (xx === clipmap.currentX && zz === clipmap.currentZ) {
				continue;
			}

			var n = this.n*s;
		/*
			if (clipmap.parentClipmap) {
				var interior1 = clipmap.parentClipmap.clipmapEntity.interior1;
				var interior2 = clipmap.parentClipmap.clipmapEntity.interior2;

				var xxx = MathUtils.moduloPositive(xx + -1, 2);
				var zzz = MathUtils.moduloPositive(zz + -1, 2);
				var xmove = xxx % 2 === 0 ? -n : n + 1;
				var zmove = zzz % 2 === 0 ? -n : n + 1;
				interior1.setTranslation(-n, 0, zmove);
				zzz = MathUtils.moduloPositive(zz, 2);
				zmove = zzz % 2 === 0 ? -n : -n + 1;
				interior2.setTranslation(xmove, 0, zmove);
			}
        */
			clipmap.clipmapEntity.setTranslation(xx * clipmap.size * 2, 0, zz * clipmap.size * 2);

			clipmap.currentX = xx // *this.dimensions.scale;
			clipmap.currentZ = zz // *this.dimensions.scale;
		}
	};

	Terrain.prototype.createClipmapLevel = function (world, material, level) {
		var entity = world.createEntity('clipmap' + level);
		entity.addToWorld();

		var n = this.n;
		var s = this.dimensions.scale

		// 0
		this.createQuadEntity(world, material, level, entity, (-2 * n -0), (-2 * n), (4*n +2), n);
	//	this.createQuadEntity(world, material, level, entity, -1 * n, -2 * n, n, n);
	//	this.createQuadEntity(world, material, level, entity, 0 * n , -2 * n, 2, n);
	//	this.createQuadEntity(world, material, level, entity, 2, -2 * n, n, n);
	//	this.createQuadEntity(world, material, level, entity, 2 + 1 * n, -2 * n, n, 3*n);

		// 1
		this.createQuadEntity(world, material, level, entity, (-2 * n), (-1 * n), n, (2*n+2));
	//	this.createQuadEntity(world, material, level, entity, -2 * n, 0		, n, 2);
	//	this.createQuadEntity(world, material, level, entity, -2 * n, 2		, n, n);

		// 2
		this.createQuadEntity(world, material, level, entity, (2 + 1 * n)	, (-1 * n), n, (2*n +2));
	//	this.createQuadEntity(world, material, level, entity, 2 + 1 * n	, 0		, n, 2);
	//	this.createQuadEntity(world, material, level, entity, 2 + 1 * n	, 2		, n, n);
		// 3

		// 4
		this.createQuadEntity(world, material, level, entity, (-2 * n -0), 	(2 + 1 * n), (4*n +2), n);
	//	this.createQuadEntity(world, material, level, entity, -1 * n, 	2 + 1 * n, n, n);
	//	this.createQuadEntity(world, material, level, entity, 0, 		2 + 1 * n, 2, n);
	//	this.createQuadEntity(world, material, level, entity, 2, 		2 + 1 * n, 2*n, n);
	//	this.createQuadEntity(world, material, level, entity, 2 + 1*n, 	2 + 1 * n, n, n);

		entity.innermost = this.createQuadEntity(world, material, level, entity, -n, -n, (n * 2 + 2), (n * 2 + 2));

		if (level !== 0) {
			entity.innermost.meshRendererComponent.hidden = true;

			// interior
		//	entity.interior1 = this.createQuadEntity(world, material, level, entity, -n, -n, (n * 2 + 2), 1);
		//	entity.interior2 = this.createQuadEntity(world, material, level, entity, -n, -n, 1, (n * 2 + 1));
		}

		return entity;
	};

	Terrain.prototype.createQuadEntity = function (world, material, level, parentEntity, x, y, w, h) {


		var meshData = this.createGrid(w+2, h+2, this.dimensions.scale);

	 	x = (x-1)*this.dimensions.scale;
	 	y = (y-1)*this.dimensions.scale;
		w = w*this.dimensions.scale;
		h = h*this.dimensions.scale;


		var entity = world.createEntity('mesh_' + w + '_' + h, meshData, material);



	//	entity.transformComponent.transform.scale.set(this.scale);

		entity.meshDataComponent.modelBound.xExtent = w * 0.5;
		entity.meshDataComponent.modelBound.yExtent = 255;
		entity.meshDataComponent.modelBound.zExtent = h * 0.5;
		entity.meshDataComponent.modelBound.center.setd(w * 0.5, 128, h * 0.5);
		entity.meshDataComponent.autoCompute = false;
		entity.meshRendererComponent.isPickable = false;

		entity.setTranslation(x, 0, y);
		// entity.setTranslation(x * 1.05, 0, y * 1.05);

		parentEntity.attachChild(entity);
		entity.addToWorld();

		return entity;
	};


	Terrain.prototype.createGrid = function (w, h, scale) {
		var key = w + '_' + h;

		if (this._gridCache[key]) {
			console.log("Cached key:", key)
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
				vertices[index * 3 + 0] = x*scale;
				vertices[index * 3 + 1] = 0;
				vertices[index * 3 + 2] = y*scale;
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

	//	console.log((w + 1) * (h + 1), (w * 2 + 4) * h, w * h * 6);

		return meshData;
	};

	var tileScales = {
		scaleGround1 : 60,
		scaleGround2 : 40,
		scaleGround3 : 60,
		scaleGround4 : 80,
		scaleGround5 : 50,
		scaleBedrock : 20
	};

	var tunableUniforms = {
		rockSlope    : 0.3
	};

	function getTunableUniform(uniform) {
		return tunableUniforms[uniform];
	};

	function setTunableUniform(uniform, value) {
		tunableUniforms[uniform, value];
	};

	var materialProperties = {
		culling:true
	};

	var heightScale = 1;
	function setHeightScale(scale) {
		heightScale = scale;
	}

	function getHeightScale() {
		return heightScale;
	}

	function setTileScale(uniform, value) {
		tileScales[uniform] = value;
	}

	function getTileScaleValue(uniform) {
		return tileScales[uniform];
	}

	function setMaterialProperty(property, value) {
		materialProperties[property] = value;
	}

	function getMaterialPropertyValue(property) {
		return materialProperties[property];
	}

	Terrain.prototype.setShaderUniform = function(uniform, value) {
		setTileScale(uniform, value);
		for (var i = 0; i < this.terrainMaterials.length; i++) {
			this.terrainMaterials[i].shader.uniforms[uniform] = value;
		}
	};

	Terrain.prototype.setMaterialProperty = function(property, value) {
		this.materialSettings[property] = value;
		for (var i = 0; i < this.terrainMaterials.length; i++) {
			this.terrainMaterials[i][property] = value;
		}
	};

	var terrainShaderDefFloat = {
		defines: {
			SKIP_SPECULAR: true
		},
		processors: [
			ShaderBuilder.light.processor,
			function (shader) {
				if (ShaderBuilder.USE_FOG) {
					shader.defines.FOG = true;
					shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
					shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
				} else {
					delete shader.defines.FOG;
				}
			}
		],
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA_TRANSLATION,
			heightMap: 'HEIGHT_MAP',
			scaleHeightWidth:1,
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
			rockSlope: getTunableUniform('rockSlope'),
			scaleGround1: getTileScaleValue('scaleGround1'),
			scaleGround2: getTileScaleValue('scaleGround2'),
			scaleGround3: getTileScaleValue('scaleGround3'),
			scaleGround4: getTileScaleValue('scaleGround4'),
			scaleGround5: getTileScaleValue('scaleGround5'),
			scaleBedrock: getTileScaleValue('scaleBedrock'),
			fogSettings: function () {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function () {
				return ShaderBuilder.FOG_COLOR;
			},
			resolution: [255, 1, 512, 512],
			resolutionNorm: [255, 255],
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
				'uniform float scaleHeightWidth;',
				'uniform vec4 resolution;',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec4 alphaval;',

				ShaderBuilder.light.prevertex,

				'const vec2 alphaOffset = vec2(45.0);',
				'const vec2 oneOverWidth = vec2(1.0 / 16.0);',

				'void main(void) {',
				'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0) ;',

				'worldPos.x = worldPos.x +cameraPosition.x;',
				'worldPos.y = worldPos.y +cameraPosition.y;',
				'worldPos.z = worldPos.z +cameraPosition.z;',

				'vec2 coord = (worldPos.xz + vec2(0.5, 0.5)) / resolution.zw/vec2(scaleHeightWidth, scaleHeightWidth);',

				'vec4 heightCol = texture2D(heightMap, coord);',
				'float zf = heightCol.r;',
				'float zd = heightCol.g;',

				'vec2 alpha = clamp((abs(worldPos.xz - cameraPosition.xz) * resolution.y / scaleHeightWidth - alphaOffset) * oneOverWidth, vec2(0.0), vec2(1.0));',
				'alpha.x = max(alpha.x, alpha.y);',
				'float z = mix(zf, zd, alpha.x);',
				'z = coord.x <= 0.0 || coord.x >= 1.0 || coord.y <= 0.0 || coord.y >= 1.0 ? -2000.0 : z;',
				'alphaval = vec4(zf, zd, alpha.x, z);',

				'worldPos.y = z * resolution.x;',

				'worldPos.x = worldPos.x - cameraPosition.x;',
				'worldPos.y = worldPos.y - cameraPosition.y;',
				'worldPos.z = worldPos.z - cameraPosition.z;',

				'gl_Position = viewProjectionMatrix * worldPos;',

				'vWorldPos = (worldPos.xyz / vec3(scaleHeightWidth, scaleHeightWidth, scaleHeightWidth))+(cameraPosition/scaleHeightWidth);',
				'viewPosition = cameraPosition/vec3(scaleHeightWidth, scaleHeightWidth, scaleHeightWidth) - vWorldPos;',

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
				'uniform float rockSlope;',

				'uniform float scaleGround1;',
				'uniform float scaleGround2;',
				'uniform float scaleGround3;',
				'uniform float scaleGround4;',
				'uniform float scaleGround5;',
				'uniform float scaleBedrock;',

				'uniform vec2 resolutionNorm;',

				// 'uniform vec2 resolution;',
				// 'uniform sampler2D heightMap;',
				'uniform vec3 cameraPosition;',
				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec4 alphaval;',
				'uniform float scaleHeightWidth;',

				ShaderBuilder.light.prefragment,

				'void main(void) {',
				//	'if (alphaval.w < -10000.0) discard;',
					'vec2 mapcoord = vWorldPos.xz / resolutionNorm;',

				//	'mapcoord = mapcoord;',

					'vec4 final_color = vec4(1.0);',

					'vec3 N = (texture2D(normalMap, mapcoord).xyz * vec3(2.0) - vec3(1.0)).xzy;',
				//	'N.x = N.x / scaleHeightWidth;',
				//	'N.z = N.z / scaleHeightWidth;',
				//	'N.y = N.y / scaleHeightWidth;',
					'N = normalize(N);',


					'vec2 coord  = mapcoord * vec2(scaleGround1);',
					'vec2 coord1 = mapcoord * vec2(scaleGround2);',
					'vec2 coord2 = mapcoord * vec2(scaleGround3);',
					'vec2 coord3 = mapcoord * vec2(scaleGround4);',
					'vec2 coord4 = mapcoord * vec2(scaleGround5);',
					'vec2 coord5 = mapcoord * vec2(scaleBedrock);',

					'vec4 splat = texture2D(splatMap, mapcoord);',
					'vec4 g1 = texture2D(groundMap1, coord);',
					'vec4 g2 = texture2D(groundMap2, coord1);',
					'vec4 g3 = texture2D(groundMap3, coord2);',
					'vec4 g4 = texture2D(groundMap4, coord3);',
					'vec4 g5 = texture2D(groundMap5, coord4);',
					'vec4 stone = texture2D(stoneMap,coord5);',

					'final_color = mix(g1, g2, splat.r);',
					'final_color = mix(final_color, g3, splat.g);',
					'final_color = mix(final_color, g4, splat.b);',
					'final_color = mix(final_color, g5, splat.a);',

					'float slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
					'slope = smoothstep(rockSlope, rockSlope*1.04, slope);',
					'final_color = mix(final_color, stone, slope);',

					// 'vec3 detail = texture2D(detailMap, mapcoord).xyz;',
					// 'final_color.rgb = mix(final_color.rgb, detail, smoothstep(30.0, 60.0, length(viewPosition)));',

					'#ifdef LIGHTMAP',
					'final_color = final_color * texture2D(lightMap, mapcoord);',
					'#else',
					ShaderBuilder.light.fragment,
					'#endif',

					'#ifdef FOG',
					'float d = pow(smoothstep(fogSettings.x/scaleHeightWidth, fogSettings.y/scaleHeightWidth, length(viewPosition)), 1.0);',
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
			scaleHeightWidth:1,
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
			'uniform float scaleHeightWidth;',
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
			scaleHeightWidth:1,
			diffuseMap : Shader.DIFFUSE_MAP,
			splatMap : 'SPLAT_MAP'
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',
		'uniform float scaleHeightWidth;',
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
			scaleHeightWidth:1,
			diffuseMap : Shader.DIFFUSE_MAP,
			heightMap : 'HEIGHT_MAP'
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',
		'uniform float scaleHeightWidth;',
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
			scaleHeightWidth:1,
			height: 0,
			diffuseMap : Shader.DIFFUSE_MAP,
			heightMap : 'HEIGHT_MAP'
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',
		'uniform float scaleHeightWidth;',
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
			cameraPosition: Shader.CAMERA_TRANSLATION,
			scaleHeightWidth:1,
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
		'uniform float scaleHeightWidth;',
		'varying float depth;',

		'const vec2 alphaOffset = vec2(45.0);',
		'const vec2 oneOverWidth = vec2(1.0 / 16.0);',

		'void main(void) {',
			'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'vec2 coord = (cameraPosition.xz + worldPos.xz + vec2(0.5, 0.5)) / resolution.zw/vec2(scaleHeightWidth, scaleHeightWidth);',

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
			scaleHeightWidth:2.0,
			// normalMap : Shader.NORMAL_MAP,
			resolution : [256, 256],
			height	: 0.05
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform float scaleHeightWidth;',
			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0);",
			"}"
		].join("\n"),
		fshader: [
			"uniform float height;",
			"uniform vec2 resolution;",
			"uniform sampler2D heightMap;",

			// "uniform sampler2D normalMap;",

			"varying vec2 vUv;",

			"void main() {",
			//	"resolution = resolution * vec2(scaleHeightWidth, scaleHeightWidth);",
				"float val = texture2D(heightMap, vUv).x;",
				"float valU = texture2D(heightMap, vUv + vec2(1.0 / resolution.x, 0.0)).x;",
				"float valV = texture2D(heightMap, vUv + vec2(0.0, 1.0 / resolution.y)).x;",

				'vec3 normal = vec3(val - valU, val - valV, height);',
				// 'normal.rgb += vec3(texture2D(normalMap, vUv).rg * 2.0 - 1.0, 0.0);',
				"gl_FragColor = vec4((0.5 * normalize(normal) + 0.5), 1.0);",
			"}"
		].join("\n")
	};

	return Terrain;
});
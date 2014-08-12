define([
		'goo/addons/terrainpack/Terrain',
        'goo/addons/terrainpack/TerrainDataManager',
		'goo/addons/terrainpack/TerrainQuery',
		'goo/addons/terrainpack/Vegetation',
		'goo/addons/terrainpack/Forest',
		'goo/math/Vector3',
		'goo/util/Ajax',
		'goo/math/Transform',
		'goo/math/MathUtils',
		'goo/renderer/Texture',
		'goo/renderer/TextureCreator',
		'goo/util/rsvp'
	],
	function(
		Terrain,
		TerrainDataManager,
		TerrainQuery,
		Vegetation,
		Forest,
		Vector3,
		Ajax,
		Transform,
		MathUtils,
		Texture,
		TextureCreator,
		RSVP
	) {
		'use strict';

		function TerrainHandler(goo, terrainSize, clipmapLevels, resourceFolder, terrainSettings) {
			this.goo = goo;
			this.terrainSize = terrainSize;
			this.resourceFolder = resourceFolder;
			this.terrain = new Terrain(goo, this.terrainSize, clipmapLevels, terrainSettings.scale);
			this.terrainDataManager = new TerrainDataManager();
			this.terrainDataManager.setResourceFolder(this.resourceFolder);
			this.vegetation = new Vegetation();
			this.forest = new Forest();

			this.hidden = false;
			this.store = new Vector3();
			this.settings = null;
			this.pick = true;
			this.draw = false;
			this.eventX = 0;
			this.eventY = 0;
			this.vegetationSettings = {
				gridSize: 4,
				patchSize: 25,
				patchDensity: 20
			};
		}

		TerrainHandler.prototype.setTerrainScale = function(scale) {
			this.terrain.scale = scale;
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
				this.goo.renderer.domElement.addEventListener("mousedown", mousedown.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mouseup", mouseup.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mouseout", mouseup.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mousemove", mousemove.bind(this), false);
			} else {
				this.goo.renderer.domElement.removeEventListener("mousedown", mousedown);
				this.goo.renderer.domElement.removeEventListener("mouseup", mouseup);
				this.goo.renderer.domElement.removeEventListener("mouseout", mouseup);
				this.goo.renderer.domElement.removeEventListener("mousemove", mousemove);
				this.terrainInfo = this.terrain.getTerrainData();
				this.draw = false;
				LMB = false;
			}
			this.forest.toggle();
			this.vegetation.toggle();
		};

		TerrainHandler.prototype.loadTerrainData = function(path) {
			return this.terrainDataManager.loadProjectData(path);
		};


		TerrainHandler.prototype.preload = function (terrainData) {

			return this.loadTerrainData(terrainData).then(function (loadedData) {

				if (loadedData.local) {
					this.terrainBuffer = this.terrainDataManager.decodeBase64(loadedData['height_map.raw']);
					this.splatBuffer = this.terrainDataManager.decodeBase64(loadedData['splat_map.raw']);
				} else {
					this.terrainBuffer = loadedData['height_map.raw'];
					this.splatBuffer = loadedData['splat_map.raw'];
				}

				if (loadedData.Vegetation) {
					this.vegetationSettings = {
						gridSize: loadedData.Vegetation.gridSize,
						patchSize: loadedData.Vegetation.patchSize,
						patchDensity: loadedData.Vegetation.patchDensity
					};
				}

				if (loadedData.Materials) {
					for (var index in loadedData.Materials) {
						this.terrain.setShaderUniform(index, loadedData.Materials[index]);
					}
				}
			}.bind(this));
		};

		TerrainHandler.prototype.initLevel = function (terrainData, settings, forestLODEntityMap) {
			this.terrainData = terrainData;
			this.settings = settings;
			var terrainSize = this.terrainSize;

			var queryReadyCallback = function() {
				this.loadVegetationAndForest(forestLODEntityMap);
			}.bind(this);


				var terrainArray;
				if (this.terrainBuffer) {
					terrainArray = new Float32Array(this.terrainBuffer);
				} else {
					terrainArray = new Float32Array(terrainSize * terrainSize);
				}

				var splatArray;
				if (this.splatBuffer) {
					splatArray = new Uint8Array(this.splatBuffer);
				} else {
					splatArray = new Uint8Array(terrainSize * terrainSize * 4 * 4);
				}

				return this.loadTextureData(terrainData, terrainArray, splatArray, queryReadyCallback);

		};

		TerrainHandler.prototype.applyTextures = function(parentMipmap, splatMap, textures, materialsReadyCB) {


			this.terrain.init({
				heightMap: parentMipmap,
				splatMap: splatMap,
				ground1: textures[0],
				ground2: textures[1],
				ground3: textures[2],
				ground4: textures[3],
				ground5: textures[4],
				stone: textures[5]
			}, materialsReadyCB);
			return this.terrain.getTerrainData();
		};

		TerrainHandler.prototype.loadTerrainQuery = function() {
			this.terrainQuery = new TerrainQuery(this.terrainSize, this.terrainData, this.terrain);
		};

		TerrainHandler.prototype.addVegetation = function(atlasUrl, vegetationTypes, onLoaded) {
			var vegetationAtlasTexture = new TextureCreator().loadTexture2D(atlasUrl, {}, onLoaded);
			vegetationAtlasTexture.anisotropy = 4;
			this.vegetation.init(this.goo.world, this.terrainQuery, vegetationAtlasTexture, vegetationTypes, this.vegetationSettings);
		};

		TerrainHandler.prototype.addForest = function(atlasUrl, normalsUrl, forestTypes, onLoaded, forestLODEntityMap) {
			var forestAtlasTexture = new TextureCreator().loadTexture2D(atlasUrl, {}, onLoaded);
			forestAtlasTexture.anisotropy = 4;
			var forestAtlasNormals = new TextureCreator().loadTexture2D(normalsUrl, {}, onLoaded);
			console.log("FOREST INIT:",forestAtlasTexture, forestAtlasNormals, forestTypes, forestLODEntityMap)
			this.forest.init(this.goo.world, this.terrainQuery, forestAtlasTexture, forestAtlasNormals, forestTypes, forestLODEntityMap);
		    console.log(this.forest)
		};

		TerrainHandler.prototype.loadTextureData = function (terrainData, parentMipmap, splatMap, queryReadyCallback) {

			var terrainInfoReady = function() {
				this.loadTerrainQuery();
				queryReadyCallback();
			}.bind(this);

			var texturesLoadedCallback = function (textures) {
				this.terrainInfo = this.applyTextures(parentMipmap, splatMap, textures, terrainInfoReady);
			}.bind(this);
 			this.terrainDataManager._loadTextures(this.resourceFolder, terrainData, texturesLoadedCallback);
		};

		TerrainHandler.prototype.loadVegetationAndForest = function (forestLODEntityMap) {

				var texturesPromise = new RSVP.Promise();

				var loadCount = 3;
				var onLoaded = function() {
					if (!--loadCount)
					texturesPromise.resolve();
				};

				this.addVegetation(this.resourceFolder + this.terrainData.vegetationAtlas,  this.terrainData.vegetationTypes, onLoaded);
				var forestAtlasUrl = this.resourceFolder +  this.terrainData.forestAtlas
				var forestNormalsUrl = this.resourceFolder +  this.terrainData.forestAtlasNormals
				this.addForest(forestAtlasUrl, forestNormalsUrl, this.terrainData.forestTypes, onLoaded, forestLODEntityMap);

				return texturesPromise;

		};

		TerrainHandler.prototype._load = function (terrainData, parentMipmap, splatMap, forestLODEntityMap) {
			var texturesLoadedCallback = function (textures) {

				this.terrainInfo = this.applyTextures(parentMipmap, splatMap, textures);
				this.loadTerrainQuery();

				var texturesPromise = new RSVP.Promise();

				var loadCount = 3;
				var onLoaded = function() {
					if (!--loadCount)
					texturesPromise.resolve();
				};

				this.addVegetation(this.resourceFolder + this.terrainData.vegetationAtlas,  this.terrainData.vegetationTypes, onLoaded);
				var forestAtlasUrl = this.resourceFolder +  this.terrainData.forestAtlas
				var forestNormalsUrl = this.resourceFolder +  this.terrainData.forestAtlasNormals
				this.addForest(forestAtlasUrl, forestNormalsUrl, this.terrainData.forestTypes, onLoaded, forestLODEntityMap);

				return texturesPromise;
			}.bind(this);

			this.terrainDataManager._loadTextures(this.resourceFolder, terrainData, texturesLoadedCallback);

		};

		TerrainHandler.prototype.updatePhysics = function () {
			this.terrain.updateAmmoBody();
			this.heightsEdited();
		};

		TerrainHandler.prototype.heightsEdited = function () {
			this.terrainQuery.updateTerrainInfo();
		};

		TerrainHandler.prototype.initPhysics = function () {
			this.ammoBody = this.terrain.initAmmoBody();
		};

		TerrainHandler.prototype.useLightmap = function(data, size) {
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
			if (this.forest) {
				this.forest.update(pos.x, pos.z);
			}
		};

		return TerrainHandler;
	});
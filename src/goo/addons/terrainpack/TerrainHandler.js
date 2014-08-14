define([
		'goo/addons/terrainpack/Terrain',
        'goo/addons/terrainpack/TerrainDataManager',
		'goo/addons/terrainpack/TerrainQuery',
		'goo/addons/terrainpack/HeightMapEditor',
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
		HeightMapEditor,
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
			this.heightMapEditor = new HeightMapEditor(goo, this);
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
			console.log('Terrain Handler : ', this);
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

		TerrainHandler.prototype.toggleEditMode = function () {
			this.heightMapEditor.toggleEditMode();
		};

		TerrainHandler.prototype.loadTerrainData = function(path) {
			return this.terrainDataManager.loadProjectData(path);
		};


		TerrainHandler.prototype.preload = function (terrainData, dataHandler) {
			return this.loadTerrainData(terrainData).then(function (loadedData) {
				dataHandler(loadedData);
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
				this.heightMapEditor.update(cameraEntity);
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
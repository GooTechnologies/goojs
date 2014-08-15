define([
		'goo/addons/terrainpack/Terrain',
        'goo/addons/terrainpack/TerrainDataManager',
		'goo/addons/terrainpack/TerrainQuery',
		'goo/math/Vector3',
		'goo/util/Ajax',
		'goo/math/Transform',
		'goo/math/MathUtils',
		'goo/renderer/Texture'
	],
	function(
		Terrain,
		TerrainDataManager,
		TerrainQuery,
		Vector3,
		Ajax,
		Transform,
		MathUtils,
		Texture
	) {
		'use strict';

		function TerrainHandler(goo, terrainSize, clipmapLevels, resourcePath, terrainSettings) {
			this.goo = goo;
			this.terrainSize = terrainSize;
			this.resourcePath = resourcePath;
			this.terrain = new Terrain(goo, this.terrainSize, clipmapLevels, terrainSettings.scale);

			this.terrainDataManager = new TerrainDataManager();
			this.terrainDataManager.setResourceFolder(this.resourcePath);

			this.hidden = false;
			this.store = new Vector3();
			this.settings = null;
			this.pick = true;
			this.draw = false;
			this.eventX = 0;
			this.eventY = 0;

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

		TerrainHandler.prototype.loadTerrainData = function(path) {
			return this.terrainDataManager.loadProjectData(path);
		};


		TerrainHandler.prototype.preload = function (terrainData, dataHandler) {
			console.log("Preload: ", terrainData)
			return this.loadTerrainData(terrainData).then(function (loadedData) {
				console.log("Loaded", loadedData)
				dataHandler(loadedData);
			}.bind(this));
		};

		TerrainHandler.prototype.initLevel = function (terrainData, settings, callback) {
			this.terrainData = terrainData;
			this.settings = settings;
			var terrainSize = this.terrainSize;
			console.log("Init TH")
			var queryReadyCallback = function(terrainQuery) {
				callback(terrainQuery);
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
			return this.terrainQuery;
		};



		TerrainHandler.prototype.loadTextureData = function (terrainData, parentMipmap, splatMap, queryReadyCallback) {
			console.log("textures loadTextureData", terrainData)
			var terrainInfoReady = function() {
				queryReadyCallback(this.loadTerrainQuery());
			}.bind(this);

			var texturesLoadedCallback = function (textures) {
				console.log("textures loaded", textures)
				this.terrainInfo = this.applyTextures(parentMipmap, splatMap, textures, terrainInfoReady);
			}.bind(this);
 			this.terrainDataManager._loadTextures(this.resourcePath, terrainData, texturesLoadedCallback);
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
				this.terrain.update(pos);
			}

		};

		return TerrainHandler;
	});
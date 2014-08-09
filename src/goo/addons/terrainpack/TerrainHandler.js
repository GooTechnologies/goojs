define([
		'goo/addons/terrainpack/Terrain',
        'goo/addons/terrainpack/TerrainDataManager',
		'goo/addons/terrainpack/TerrainQuery',
		'goo/addons/terrainpack/Vegetation',
		'goo/addons/terrainpack/Forrest',
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

		function TerrainHandler(goo, terrainSize, clipmapLevels, resourceFolder) {
			this.goo = goo;
			this.terrainSize = terrainSize;
			this.resourceFolder = resourceFolder;
			this.terrain = new Terrain(goo, this.terrainSize, clipmapLevels);
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
				gridSize: 7
			};
		}

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

		TerrainHandler.prototype.initLevel = function (terrainData, settings, forestLODEntityMap) {
			this.settings = settings;
			var terrainSize = this.terrainSize;

			var terrainPromise = this.terrainDataManager._loadData(terrainData.heightMap);
			var splatPromise = this.terrainDataManager._loadData(terrainData.splatMap);

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

				return this._load(terrainData, terrainArray, splatArray, forestLODEntityMap);
			}.bind(this));
		};

		TerrainHandler.prototype.applyTextures = function(parentMipmap, splatMap, textures) {
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
			return this.terrain.getTerrainData();
		};

		TerrainHandler.prototype._load = function (terrainData, parentMipmap, splatMap, forestLODEntityMap) {
			var texturesLoadedCallback = function (textures) {

				this.terrainInfo = this.applyTextures(parentMipmap, splatMap, textures);

				this.terrainQuery = new TerrainQuery(this.terrainSize, terrainData, this.terrain);

				var texturesPromise = new RSVP.Promise();
				var loadCount = 3;
				var onLoaded = function() {
					if (!--loadCount)
						texturesPromise.resolve();
				};

				var vegetationAtlasTexture = new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.vegetationAtlas, {}, onLoaded);

				vegetationAtlasTexture.anisotropy = 4;
				var vegetationTypes = terrainData.vegetationTypes;

				var forestAtlasTexture = new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.forestAtlas, {}, onLoaded);

				forestAtlasTexture.anisotropy = 4;
				var forestAtlasNormals = new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.forestAtlasNormals, {}, onLoaded);


				this.vegetation.init(this.goo.world, this.terrainQuery, vegetationAtlasTexture, vegetationTypes, this.vegetationSettings);
				this.forest.init(this.goo.world, this.terrainQuery, forestAtlasTexture, forestAtlasNormals, terrainData.forestTypes, forestLODEntityMap);

				return texturesPromise;
			}.bind(this);

			this.terrainDataManager._loadTextures(this.resourceFolder, terrainData, texturesLoadedCallback);

		};

		TerrainHandler.prototype.updatePhysics = function () {
			this.terrain.updateAmmoBody();
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
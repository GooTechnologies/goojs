"use strict";

define([
	'goo/addons/terrainpack/editor/TerrainEditorAPI',
	'goo/addons/terrainpack/ConfiguredArea',
	'goo/renderer/TextureCreator',
	'goo/addons/terrainpack/Forest',
	'goo/addons/terrainpack/Vegetation'
], function(
	TerrainEditorAPI,
	ConfiguredArea,
	TextureCreator,
	Forest,
	Vegetation
	) {

	var version = 0.1;

	var TerrainAPI = function(goo, worldLoader) {
		this.goo = goo;
		this.worldLoader = worldLoader;
		this.configurations = [];
		this.includeEditor(version);
	};

	TerrainAPI.prototype.createArea = function(resourcePath, areaData, forestLodMap, readyCallback) {

		var terrainReady = function(areaConfig, terrainQuery, loadedData) {
			console.log("AreaConf", areaConfig, loadedData);
			areaConfig.setTerrainQuery(terrainQuery);
			var go = 0;
			function onLoaded(thing) {
				go += 1;
				if (go != 2) return;
				readyCallback(areaConfig)
			}

			if (loadedData.Vegetation) {
				var vegetationSettings = {
					gridSize: loadedData.Vegetation.gridSize,
					patchSize: loadedData.Vegetation.patchSize,
					patchDensity: loadedData.Vegetation.patchDensity
				};
			}

			this.addVegetation(resourcePath, areaConfig, vegetationSettings, onLoaded);
			var forest = this.addForest(resourcePath, areaConfig, forestLodMap, onLoaded);

			if (loadedData.Forest) {
				forest.setTreeLODvalues(
					loadedData.Forest.patchSize,
					loadedData.Forest.patchDensity,
					loadedData.Forest.gridSize,
					loadedData.Forest.minDist
				);
				forest.setTreeScale(loadedData.Forest.treeScale);
				forest.setRandomSeed(loadedData.Forest.randomSeed);
			} else {
				forest.setTreeLODvalues(45, 5, 15, 1.4);
			}

			if (loadedData.Ground) {
				for (var index in loadedData.Ground) {
					for (var vegType in loadedData.Ground[index].vegetation) {
						areaConfig.ground.data[index].vegetation[vegType] = loadedData.Ground[index].vegetation[vegType];
					}

					for (var treeType in loadedData.Ground[index].forest) {
						areaConfig.ground.data[index].forest[treeType] = loadedData.Ground[index].forest[treeType];
					}
				}
			}


		}.bind(this);

		var terrainConfigured = function(areaConfig, terrainEditSettings) {
			areaConfig.applyConfiguredTerrain(terrainReady, terrainEditSettings);
		};

		this.loadTerrainResources(resourcePath, areaData, terrainConfigured);
	};


	TerrainAPI.prototype.loadTerrainResources = function(resourcePath, areaData, readyCallback) {

		var terrainEditSettings = {
			edit: false,
			scale: 1,
			mode: 'height',
			brush: 'flare.png',
			size: 16,
			power: 10,
			rgba: 'ground2'
		};


		var areaConf = new ConfiguredArea(version, this.goo, resourcePath, areaData, readyCallback, terrainEditSettings);
		this.configurations.push(areaConf);
	};

	TerrainAPI.prototype.loadStoredMaterial = function() {
		var foundCb = function(data) {
			for (var i = 0; i < this.configurations.length; i++) {
				for (var index in data) {
					this.configurations[i].terrainHandler.terrain.setShaderUniform(index, data[index]);
					this.configurations[i].tuneShaderUniform(index, data[index])
				}
			}
		}.bind(this);

		var notFoundCb = function(key) {
			console.log("Key not found in localStorage: ", key)

			var tileScales = {
				scaleGround1 : 60,
				scaleGround2 : 40,
				scaleGround3 : 60,
				scaleGround4 : 80,
				scaleGround5 : 50,
				scaleBedrock : 20
			};

			for (var index in tileScales) {
				for (var i = 0; i < this.configurations.length; i++) {
					this.configurations[i].terrainHandler.terrain.setShaderUniform(index, tileScales[index]);
					this.configurations[i].tuneShaderUniform(index, tileScales[index])
				}
			}
		}.bind(this);

		this.worldLoader.loadLocalStorage('Materials', foundCb, notFoundCb);
	};

	TerrainAPI.prototype.loadStoredVegetation = function() {
		var foundCb = function(data) {
			for (var i = 0; i < this.configurations.length; i++) {
				this.configurations[i].vegetation.setVegetationDensities(data.patchSize, data.patchDensity, data.gridSize);
				this.configurations[i].vegetation.rebuild();
			}
		}.bind(this);

		var notFoundCb = function(key) {
			console.log("Key not found in localStorage: ", key)
		};

		this.worldLoader.loadLocalStorage('Vegetation', foundCb, notFoundCb);
	};


	TerrainAPI.prototype.loadStoredConfigs = function() {
		this.loadStoredMaterial();
		this.loadStoredVegetation();
	};

	TerrainAPI.prototype.addVegetation = function(resourcePath, areaConfig, vegetationSettings, onLoaded) {

		this.vegetationSettings = {
			gridSize: vegetationSettings.gridSize || 4,
			patchSize: vegetationSettings.patchSize || 25,
			patchDensity: vegetationSettings.patchDensity || 20
		};

		areaConfig.vegetation = new Vegetation(areaConfig.getTerrainQuery());
		console.log("Add Vegetation: ", resourcePath, areaConfig.plantsConfig.data.vegetationAtlas, areaConfig);
		var vegetationAtlasTexture = new TextureCreator().loadTexture2D(resourcePath+areaConfig.plantsConfig.data.vegetationAtlas, {}, onLoaded);
		vegetationAtlasTexture.anisotropy = 4;
		areaConfig.vegetation.init(this.goo.world, areaConfig, vegetationAtlasTexture, this.vegetationSettings);
	};

	TerrainAPI.prototype.addForest = function(resourcePath, areaConfig, forestLODEntityMap, onLoaded) {
		console.log("Add Forest: ", resourcePath, areaConfig, forestLODEntityMap);
		var forestData = areaConfig.forestConfig;

		var loadCount = 2;
		var loadedCount = function() {
			if (!--loadCount)
				onLoaded("Forest Textures OK");
		};

		var atlasUrl = resourcePath +  forestData.atlas.data.forestAtlas;
		var normalsUrl = resourcePath +  forestData.atlas.data.forestAtlasNormals;
		var trees = forestData.trees;

		areaConfig.forest = new Forest(areaConfig.getTerrainQuery());
		var forestAtlasTexture = new TextureCreator().loadTexture2D(atlasUrl, {}, loadedCount);
		forestAtlasTexture.anisotropy = 4;
		var forestAtlasNormals = new TextureCreator().loadTexture2D(normalsUrl, {}, loadedCount);
		areaConfig.forest.init(this.goo.world, forestData, forestAtlasTexture, forestAtlasNormals, trees, forestLODEntityMap);
		return areaConfig.forest;
	};


	TerrainAPI.prototype.updateTerrain = function(tpf, cameraEntity) {
		var pos = cameraEntity.cameraComponent.camera.translation;

		for (var i = 0; i < this.configurations.length; i++) {
			this.configurations[i].updateTerrain(tpf, cameraEntity);
			if (this.configurations[i].vegetation) {
				this.configurations[i].vegetation.update(pos.x, pos.z);
			}
			if (this.configurations[i].forest) {
				this.configurations[i].forest.update(pos.x, pos.z);
			}
		}

		if (this.edit) this.terrainEditorAPI.update(cameraEntity);
	};

	TerrainAPI.prototype.includeEditor = function(version) {
		this.terrainEditorAPI = new TerrainEditorAPI(version, this);
		this.edit = false;
		var tApi = this;
		var enableEditButton = function(editorApi) {

			var button = document.getElementById("EditTerrain");
			button.addEventListener('click', function() {
				editorApi.editTerrain(0, version);
				setTimeout(function() {
					tApi.edit = ! tApi.edit;
				}, 200);

			}, false);

			button.innerHTML = "Editor (v "+version+")";
		};

		enableEditButton(this);
	};

	TerrainAPI.prototype.editTerrain = function(index) {
		var conf = this.configurations[index];
		if (!conf) console.error("No terrain conf for index: ", index, this.configurations);
		this.terrainEditorAPI.enableEditMode(index, conf)
	};

    TerrainAPI.prototype.getHeightAt = function(posVector) {
        return this.configurations[0].terrainHandler.getHeightAt(posVector.data)
    };

	TerrainAPI.prototype.setTerrainDimensions = function(size) {

	};

	TerrainAPI.prototype.getTerrainForDownload = function(index, callback) {
		return this.configurations[index].fetchProjectData(callback);
	};

	return TerrainAPI;
});

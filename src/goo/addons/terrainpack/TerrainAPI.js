"use strict";

define([
	'goo/addons/terrainpack/editor/TerrainEditorAPI',
	'goo/renderer/TextureCreator',
	'goo/addons/terrainpack/Forest',
	'goo/addons/terrainpack/Vegetation'
], function(
	TerrainEditorAPI,
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

	var terrainEditSettings = {
		edit: false,
		scale: 1,
		mode: 'height',
		brush: 'flare.png',
		size: 16,
		power: 10,
		rgba: 'ground2'
	};

	var terrainSettings = {
		scale: 1.4
	};

	TerrainAPI.prototype.loadTerrainResources = function(resourcePath, configurator, readyCallback) {

		var loadedCallback = function() {
			configurator.init(version, this.goo, resourcePath, readyCallback, terrainSettings, terrainEditSettings);
			this.configurations.push(configurator);
		}.bind(this);

		this.worldLoader.loadWorld(loadedCallback)
	};

	TerrainAPI.prototype.loadStoredMaterial = function() {
		var foundCb = function(data) {
			for (var i = 0; i < this.configurations.length; i++) {
				for (var index in data) {
					console.log("Writing to shader from local", index, data[index])
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
					console.log("Writing to shader from default", tileScales)
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
				this.configurations[i].vegetation.setVegetationDensities(data.patchSize, data.patchDensity, data.gridSize);;
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

	TerrainAPI.prototype.addVegetation = function(resourcePath, terrainQuery, vegetationSettings, onLoaded) {

		this.vegetationSettings = {
			gridSize: vegetationSettings.gridSize || 4,
			patchSize: vegetationSettings.patchSize || 25,
			patchDensity: vegetationSettings.patchDensity || 20
		};

		this.configurations[0].vegetation = new Vegetation();
		   console.log("Add Vegetation: ", resourcePath, terrainQuery);
		var vegetationAtlasTexture = new TextureCreator().loadTexture2D(resourcePath+terrainQuery.terrainData.vegetationAtlas, {}, onLoaded);
		vegetationAtlasTexture.anisotropy = 4;
		this.configurations[0].vegetation.init(this.goo.world, terrainQuery, vegetationAtlasTexture, terrainQuery.terrainData.vegetationTypes, this.vegetationSettings);
	};

	TerrainAPI.prototype.addForest = function(resourcePath, terrainQuery, forestLODEntityMap, onLoaded) {
		         console.log("Add Forest: ", resourcePath, terrainQuery, forestLODEntityMap)
		var loadCount = 2;
		var loadedCount = function() {
			if (!--loadCount)
				onLoaded();
		};

		var atlasUrl = resourcePath +  terrainQuery.terrainData.forestAtlas
		var normalsUrl = resourcePath +  terrainQuery.terrainData.forestAtlasNormals
		var forestTypes = terrainQuery.terrainData.forestTypes;

		this.configurations[0].forest = new Forest();
		var forestAtlasTexture = new TextureCreator().loadTexture2D(atlasUrl, {}, loadedCount);
		forestAtlasTexture.anisotropy = 4;
		var forestAtlasNormals = new TextureCreator().loadTexture2D(normalsUrl, {}, loadedCount);
		console.log("FOREST INIT:",forestAtlasTexture, forestAtlasNormals, forestTypes, forestLODEntityMap);
		this.configurations[0].forest.init(this.goo.world, terrainQuery, forestAtlasTexture, forestAtlasNormals, forestTypes, forestLODEntityMap);
		console.log(this.configurations[0].forest)

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
        var height = this.configurations[0].terrainHandler.getHeightAt(posVector.data)
        return height;
    };

	TerrainAPI.prototype.setTerrainDimensions = function(size) {

	};

	TerrainAPI.prototype.getTerrainForDownload = function(index, callback) {
		console.log(this)
		return this.configurations[index].fetchProjectData(callback);
	};

	return TerrainAPI;
});

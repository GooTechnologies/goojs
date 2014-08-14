"use strict";

define([
	'goo/addons/terrainpack/editor/TerrainEditorGUI'
], function(
	TerrainEditorGUI
	) {



	var TerrainEditorAPI = function(version, terrainApi) {
		this.terrainApi = terrainApi;
		this.editingActive = false;
		this.editingIndex = null;
		this.editorGui = new TerrainEditorGUI(version, this);
		this.configuratos = [];
		this.brushesActive = false;
		this.groundTextures = {
			GROUND_MAP1:{scaleUniform:'scaleGround1', tx:null},
			GROUND_MAP2:{scaleUniform:'scaleGround2', tx:null},
			GROUND_MAP3:{scaleUniform:'scaleGround3', tx:null},
			GROUND_MAP4:{scaleUniform:'scaleGround4', tx:null},
			GROUND_MAP5:{scaleUniform:'scaleGround5', tx:null},
			STONE_MAP  :{scaleUniform:'scaleBedrock', tx:null}
		}
	};

	TerrainEditorAPI.prototype.getConfigIndex = function() {
		return this.editingIndex;
	};

	TerrainEditorAPI.prototype.terrainDimensionsChange = function(size) {
		this.terrainApi.setTerrainDimensions(size)
	};

	TerrainEditorAPI.prototype.downloadTerrain = function() {

		var callback = function(data) {
			console.log("Request download: ", data);
			var exportData = 'data:text/json;charset=utf-8,';
			exportData += escape(JSON.stringify(data));
		//	var encodedUri = encodeURI(exportData);
			var newWindow = window.open(exportData);
		};

		this.terrainApi.getTerrainForDownload(this.editingIndex, callback);

	};

	TerrainEditorAPI.prototype.findTextureInConfigByName = function(config, txName) {
		var allEntities = config.terrainHandler.terrain.world.entityManager._entitiesById;
	//	console.log("Find TX By name ", config, allEntities, txName);


		if (this.getGroundTextures()[txName].tx != null) {
			console.log("Texture "+txName+" already populated ", this.getGroundTextures()[txName]);
			return this.getGroundTextures()[txName];
		}

		var masterTx = null;

		function digUpTx(name) {
			for (var id in allEntities) {
				var entity = allEntities[id];
	//			console.log("search entity ", entity)
				if (entity.meshRendererComponent) {
					if (!entity.meshRendererComponent.materials) {
						console.log("no mat on entity")
					} else {
						for (var i = 0; i < entity.meshRendererComponent.materials.length; i++) {
							var mat = entity.meshRendererComponent.materials[i];
							if (mat._textureMaps[name]) {
								if (!masterTx) {
									masterTx = mat._textureMaps[name]
								} else {
									if (masterTx != mat._textureMaps[name]) {
										console.log("putting mastertx in mat ", name, masterTx, mat)
										mat._textureMaps[name] = masterTx;
									}
								}
							}
						}
					}
				}
			}
			return masterTx;
		}

		var tx = digUpTx(txName);

		if (!tx) {
			console.error("Texture not found with name: "+txName);
		}

		return tx;
	};

	TerrainEditorAPI.prototype.populateTextureSetup = function(config) {
		for (var name in this.groundTextures){
			this.setGroundTextureWithName(this.findTextureInConfigByName(config, name), name);
		}
	};

	TerrainEditorAPI.prototype.setGroundTextureWithName = function(texture, name) {
		this.groundTextures[name].tx = texture;
	};

	TerrainEditorAPI.prototype.getGroundTextures = function() {
		return this.groundTextures;
	};

	TerrainEditorAPI.prototype.endEditMode = function(terrainConfigurator) {
		console.log("TerrainConfigurator: ", terrainConfigurator);
		if (terrainConfigurator.editorActive) terrainConfigurator.toggleEditing();
		this.editorGui.removeEditorGui();
	};

	TerrainEditorAPI.prototype.toggleHeightMapEditing = function(bool) {

		this.terrainHandler.toggleEditMode();
		this.terrainHandler.updatePhysics();
	};

	TerrainEditorAPI.prototype.enableEditMode = function(configIndex, config) {
		if (this.editingActive) {
			this.endEditMode(config);
			this.editingActive = false;
			return;
		}

		this.editingActive = true;
		this.editingIndex = configIndex;
		this.configuratos[configIndex] = config;
		this.editorGui.startEditOfConfig(config.terrainHandler);

		this.populateTextureSetup(config);

		this.editorGui.addTextureData(config, this.getGroundTextures(config));
		this.editorGui.addVegetation(config);
		this.editorGui.addForest(config);
	};

    TerrainEditorAPI.prototype.saveLocalStore = function(fileName, data) {

        localStorage.setItem(fileName, JSON.stringify({file:fileName, data:data}));

    };

	TerrainEditorAPI.prototype.saveBinary = function(fileName, data) {
		console.log("Save binary data: ", fileName, data);

		function _arrayBufferToBase64( buffer ) {
			var binary = '';
			var bytes = new Uint8Array( buffer );
			var len = bytes.byteLength;
			for (var i = 0; i < len; i++) {
				binary += String.fromCharCode( bytes[ i ] )
			}
			return window.btoa( binary );
		}

		var base64String = _arrayBufferToBase64(data);
        this.saveLocalStore(fileName, base64String);
	};

	return TerrainEditorAPI;
});

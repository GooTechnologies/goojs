"use strict";

define([
	'goo/renderer/TextureCreator'
], function(
	TextureCreator
	) {


	var brushes = [
		"images/effects/flare.png",
		"images/effects/particle_chalk_smoke.dds",
		"images/effects/particle_clay_chard_medium.dds",
		"images/effects/particle_dirt.dds",
		"images/effects/particle_rifle_smoke.dds",
		"images/effects/particle_stuffing_large.dds"
	];

	var EditorGUI = function(version, editorAPI) {
		this.editorAPI = editorAPI;
		this.metaData = {version:version};
	};



	EditorGUI.prototype.saveAllConfigs = function() {
		for (var i = 0; i < this.saveFunctions.length; i++) {
			this.saveFunctions[i]();
		}
	};

	EditorGUI.prototype.startEditOfConfig = function(terrainHandler) {
		this.buildGUI(terrainHandler);
	};

	EditorGUI.prototype.addVegetation = function(vegetation) {

		var editSettings = {
			patchSize   : vegetation.patchSize   ,
			patchDensity: vegetation.patchDensity,
			gridSize    : vegetation.gridSize
		};

		var vegFolder = this.gui.addFolder('Vegetation');

	//	var gridSize = vegFolder.add(editSettings, 'gridSize', 2, 30);
		var patchSize = vegFolder.add(editSettings, 'patchSize',5, 100);
		var patchDensity = vegFolder.add(editSettings, 'patchDensity', 3, 100);

		var updateValues = function() {
			vegetation.setVegetationDensities(editSettings.patchSize, editSettings.patchDensity, editSettings.gridSize);
		    vegetation.rebuild();
		};

		patchSize.onChange(function(value) {
			updateValues();
		});

		patchDensity.onChange(function(value) {
			updateValues();
		});

		var editorApi = this.editorAPI;

		var	save = function() {
			editorApi.saveLocalStore("Vegetation", editSettings);
		};

		this.saveFunctions.push(save)

	};

	EditorGUI.prototype.addForest = function(forest) {

		var editSettings = {
			patchSize   : forest.patchSize,
			patchDensity: forest.patchDensity,
			gridSize    : forest.gridSize,
			minDist		: forest.minDist,
			treeScale   : forest.treeScale || 1,
			randomSeed  : forest.randomSeed
		};

		var folder = this.gui.addFolder('Forest');

		//	var gridSize = vegFolder.add(editSettings, 'gridSize', 2, 30);
		var patchSize = folder.add(editSettings, 'patchSize', 15, 450);
		var patchDensity = folder.add(editSettings, 'patchDensity', 0.1, 20);
		var minDist = folder.add(editSettings, 'minDist', 0.1, 4);
		var treeScale = folder.add(editSettings, 'treeScale', 0.1, 3);
		var randomSeed = folder.add(editSettings, 'randomSeed', 0.1, 2);

		var updateValues = function() {
			forest.setTreeLODvalues(editSettings.patchSize, editSettings.patchDensity, editSettings.gridSize, editSettings.minDist);
			forest.rebuild();
		};

		var triggerRebuild = function() {
			forest.rebuild();
			forest.update(9999999, 999999);
		};

		patchSize.onChange(function() {
			updateValues();
		});

		patchDensity.onChange(function() {
			updateValues();
		});

		minDist.onChange(function() {
			updateValues();
		});

		treeScale.onChange(function() {
			forest.setTreeScale(editSettings.treeScale);
		});

		randomSeed.onChange(function() {
			forest.setRandomSeed(editSettings.randomSeed);
		});

		minDist.onFinishChange(function() {
			triggerRebuild();
		});

		patchDensity.onFinishChange(function() {
			triggerRebuild();
		});

		patchSize.onFinishChange(function() {
			triggerRebuild();
		});

		treeScale.onFinishChange(function() {
			triggerRebuild();
		});

		randomSeed.onFinishChange(function() {
			triggerRebuild();
		});

		var editorApi = this.editorAPI;

		var	save = function() {
			editorApi.saveLocalStore("Forest", editSettings);
		};

		this.saveFunctions.push(save)

	};

	EditorGUI.prototype.addTextureControls = function(terrainConf, txEditSettings, txFolder, tile) {

		txEditSettings[tile.scaleUniform] = terrainConf.readShaderUniform(tile.scaleUniform);

		var scale = txFolder.add(txEditSettings, tile.scaleUniform, 5, 200);

		scale.onChange(function(value) {
			terrainConf.tuneShaderUniform(tile.scaleUniform, value)
		});
	};

	EditorGUI.prototype.addGroundTypeControl = function(terrainConf, ground, groundFolder) {
		var typeFolder = groundFolder.addFolder(ground.id);

		var plantsFolder = typeFolder.addFolder("plants");
		var treesFolder = typeFolder.addFolder("trees")

		var addVegControl = function(folder, editSettings, vegType) {
			var control = folder.add(editSettings, vegType, 0, 0.99);
		    return control;
		};

		for (var index in ground.vegetation) {
			var control = addVegControl(plantsFolder, ground.vegetation, index);
			control.onChange(function(value) {
				ground.vegetation[index] = value;
			});

			control.onFinishChange(function() {
				terrainConf.vegetation.rebuild();
			})
		}

		for (var index in ground.forest) {
			var control = addVegControl(treesFolder, ground.forest, index);
			control.onChange(function(value) {
				ground.forest[index] = value;
			});

			control.onFinishChange(function() {
				terrainConf.forest.rebuild();
			})
		}

	};

	EditorGUI.prototype.addTextureData = function(terrainConf, txData) {
		console.log("Add Texture Data to Gui: ", terrainConf, txData);

		var count = 0;
		var txEditSettings = {culling: terrainConf.cullState, wireframe:false};

        var matFolder = this.gui.addFolder('Material');
        var culling = matFolder.add(txEditSettings, 'culling');

        culling.onChange(function(value) {
			terrainConf.setCullStateEnabled(value);
            console.log("Toggle terrain culling", value)
        });

		var wireframe = matFolder.add(txEditSettings, 'wireframe');

		wireframe.onChange(function(value) {
			terrainConf.setWireframeEnabled(value);
			console.log("Toggle terrain wireframe", value)
		});


		for (var tx in txData) {
			if (txData[tx]) {

				this.addTextureControls(terrainConf, txEditSettings, matFolder, txData[tx]);

				count += 1;
			}
		}


		var groundFolder = this.gui.addFolder('Ground');

		for (var ground in terrainConf.ground.data) {
			this.addGroundTypeControl(terrainConf, terrainConf.ground.data[ground], groundFolder)
		}

		var editorApi = this.editorAPI;

		var saveGround = function() {
			editorApi.saveLocalStore("Ground", terrainConf.ground.data)
		};

		var	save = function() {
			editorApi.saveLocalStore("Materials", txEditSettings);
		};

		this.saveFunctions.push(saveGround);
		this.saveFunctions.push(save)

	};


	EditorGUI.prototype.removeEditorGui = function() {
		try {
			if (this.gui)
				this.gui.destroy();
		} catch (u) {
			console.log("dat.gui crashed");
			window.document.body.removeChild(this.gui.domElement);
		}
		delete this.gui;
	};

	EditorGUI.prototype.buildGUI = function(terrainHandler) {
		this.saveFunctions = [];

		this.gui = new dat.GUI();

		window.document.body.appendChild(this.gui.domElement);
		this.gui.domElement.style.zIndex = "10000";
		this.gui.domElement.style.position = "absolute";
		this.gui.domElement.style.top = "0px";
		this.gui.domElement.style.right = "0px";

		var _this = this;
		this.guiFolders = [];

		var terrainEditSettings = this.editorAPI.terrainEditSettings;
		var terrainConfigData = terrainHandler.terrainData;

		var terrainFolder = this.gui.addFolder('Terrain');
		var editTerrain = terrainFolder.add(terrainEditSettings, 'edit');
		var editorApi = this.editorAPI;

		var dimensionsFolder = terrainFolder.addFolder('Dimensions');
		var scaleValue = dimensionsFolder.add(terrainHandler.terrain.dimensions, 'scale', [0.5, 1, 2, 4, 8, 16]);


		scaleValue.onFinishChange(function(value) {
			terrainHandler.terrain.rebuild();
		});


		editTerrain.onFinishChange(function(value) {
			editorApi.toggleHeightMapEditing(value);
		});

		terrainFolder.add(terrainEditSettings, 'mode', ['paint', 'height', 'smooth', 'flatten']);
		terrainFolder.add(terrainEditSettings, 'size').min(1);
		terrainFolder.add(terrainEditSettings, 'power', 0, 100);
		terrainFolder.add(terrainEditSettings, 'rgba', ['ground1', 'ground2', 'ground3', 'ground4', 'ground5']);
		TextureCreator.cache = [];
		console.log("TH: ", terrainHandler)
		terrainEditSettings.brushTexture = new TextureCreator().loadTexture2D(terrainHandler.resourcePath + brushes[0]);
		var brush = terrainFolder.add(terrainEditSettings, 'brush', brushes);
		brush.onFinishChange(function(value) {
			terrainEditSettings.brushTexture = new TextureCreator().loadTexture2D(terrainHandler.resourcePath + value);
		});



		var saveAll = function() {
			this.saveAllConfigs();
		}.bind(this);



			var gameControlFns = {
				'Save': function() {
					saveAll();
				},
				'Lightmap Tool':function() {
					window.open("/lightmap.html?" + levelData.id);
				},
				'Download':function() {
					editorApi.downloadTerrain();
				}
			};

		//	terrainFolder.add(gameControlFns, 'Save');


		var	save = function() {
			var data = terrainHandler.terrain.getTerrainData();
			var mapName = 'height_map.raw';
			editorApi.saveBinary( mapName, data.heights.buffer);
			mapName = 'splat_map.raw';
			editorApi.saveBinary( mapName, data.splat.buffer);
			editorApi.saveLocalStore('Meta', this.metaData);
		}.bind(this);




		this.saveFunctions.push(save);

		    var gui = this.gui;
			setTimeout(function() {
				gui.add(gameControlFns, 'Save');
				gui.add(gameControlFns, 'Download');
			}, 500);


		//	terrainFolder.add(gameControlFns, 'Lightmap Tool');
	//	}

	};

	return EditorGUI;
});

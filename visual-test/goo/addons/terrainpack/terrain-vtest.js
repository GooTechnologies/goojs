require([
	'goo/math/Vector3',
	'goo/addons/terrainpack/Terrain',
	'lib/V'
], function (
	Vector3,
	Terrain,
	V
) {
	'use strict';

	V.describe('The entities in the scene hold a rigidBody component which updates their transform.');

	var goo = V.initGoo();

	V.addLights();

	var orbitCam = V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));


	var terrain = new Terrain(goo, 128, 5);
	terrain.init({
	});
	goo.callbacks.push(function() {
		terrain.update(orbitCam.getTranslation());
	});

	V.process();

/*
	var terrainScript = Scripts.create(TerrainScript, {});
	var entity = V.goo.world.createEntity(camera, orbitScript, 'CameraEntity').addToWorld();

	function TerrainScript() {
		var terrainData = {
			"map_id": "legend01_map01",
			"heightMap": "maps/l3dt/heights16.raw",
			"heightMapBits": 16, //32,
			"heightMapScale": 0.2, //1,
			"splatMap": "maps/xxx.raw",
			"attributesMap": "maps/l3dt/attributes.png",
			"l3dtFolder": "maps/l3dt",
			"normalMap": "maps/l3dt/normals.png",
			"lightMap": "maps/l3dt/lightmap.jpg",
			"terrainConfig": "legend01",
			"vegetationDensity": {
				"patchSize": 15,
				"patchDensity": 25,
				"gridSize": 7
			},
			"forrestDensity": {
				"patchSize": 128,
				"patchDensity": 35,
				"gridSize": 7,
				"minDist": 0
			},
			"ground1": {
				"texture": "images/legend_02/ground/grass_01.jpg",
				"material": "ground_dirt_hit",
				"vegetation": {
					"grass_short_yellow_1": 0.39,
					"grass_short_green_1": 0.2,
					"grass_tall_3": 0.2,
					"grass_tall_4": 0.2,
					"thicket_1": 0.01
				}
			},
			"ground2": {
				"texture": "images/legend_02/ground/grass_02.jpg",
				"material": "ground_grass_hit",
				"vegetation": {
					"grass_short_green_1": 0.3,
					"grass_short_green_2": 0.3,
					"grass_tall_1": 0.2,
					"grass_tall_2": 0.1,
					"nettles_1": 0.1
				},
				"forrest": {
					"House 1": 0.1,
					"House 2": 0.1,
					"Tree 1": 0.1,
					"House 3": 0.1
				}
			},
			"ground3": {
				"texture": "images/legend_02/ground/gravel_clay_debris_01.jpg",
				"material": "ground_dirt_hit",
				"vegetation": {
					"grass_short_yellow_1": 0.3
				},
				"forrest": {
					"House 1": 0.3
				}
			},
			"ground4": {
				"texture": "images/legend_02/ground/gravel_01.jpg",
				"material": "ground_gravel_hit"
			},
			"ground5": {
				"texture": "images/legend_02/ground/grass_03.jpg",
				"material": "ground_grass_hit",
				"vegetation": {
					"nettles_1": 0.1,
					"thicket_1": 0.02,
					"grass_tall_2": 0.2,
					"grass_short_yellow_1": 0.2,
					"grass_tall_3": 0.1,
					"grass_tall_4": 0.1
				},
				"forrest": {
					"Tree 1": 0.3
				}
			},
			"stone": {
				"texture": "images/legend_02/ground/stone_01.jpg",
				"material": "ground_stone_hit"
			},
			"vegetationAtlas": "images/legend_02/vegetation/grass.tga",
			"vegetationTypes": {
				"grass_short_green_1": {
					"w": 1,
					"h": 0.5,
					"tx": 0,
					"ty": 0.75,
					"tw": 0.25,
					"th": 0.25
				},
				"grass_short_green_2": {
					"w": 1,
					"h": 0.5,
					"tx": 0.25,
					"ty": 0.75,
					"tw": 0.25,
					"th": 0.25
				},
				"grass_short_green_3": {
					"w": 1,
					"h": 0.5,
					"tx": 0,
					"ty": 0.5,
					"tw": 0.25,
					"th": 0.25
				},
				"grass_short_green_4": {
					"w": 1,
					"h": 0.5,
					"tx": 0.25,
					"ty": 0.5,
					"tw": 0.25,
					"th": 0.25
				},
				"grass_short_yellow_1": {
					"w": 1,
					"h": 0.5,
					"tx": 0.5,
					"ty": 0.75,
					"tw": 0.25,
					"th": 0.25
				},
				"grass_tall_1": {
					"w": 1,
					"h": 1,
					"tx": 0,
					"ty": 0,
					"tw": 0.25,
					"th": 0.5
				},
				"grass_tall_2": {
					"w": 1,
					"h": 1,
					"tx": 0.25,
					"ty": 0,
					"tw": 0.25,
					"th": 0.5
				},
				"grass_tall_3": {
					"w": 1,
					"h": 1,
					"tx": 0.5,
					"ty": 0,
					"tw": 0.25,
					"th": 0.5
				},
				"grass_tall_4": {
					"w": 1,
					"h": 1,
					"tx": 0.75,
					"ty": 0,
					"tw": 0.25,
					"th": 0.5
				},
				"nettles_1": {
					"w": 1.1,
					"h": 0.7,
					"tx": 0.5,
					"ty": 0.5,
					"tw": 0.25,
					"th": 0.25
				},
				"thicket_1": {
					"w": 1.1,
					"h": 1.1,
					"tx": 0.75,
					"ty": 0.5,
					"tw": 0.25,
					"th": 0.5
				}
			},
			"forrestAtlas": "images/legend_02/vegetation/impostors_diffuse.tga",
			"forrestAtlasNormals": "images/legend_02/vegetation/impostors_normal.jpg",
			"vegetationAlphaThreshold": 0.2,
			"forrestAlphaThreshold": 0.4,
			"forrestTypes": {
				"House 1": {
					"w": 0.01,
					"h": 0.01,
					"tx": 0,
					"ty": 0,
					"tw": 0.01,
					"th": 0.01,
					"forbidden": true
				},
				"House 2": {
					"w": 0.01,
					"h": 0.01,
					"tx": 0,
					"ty": 0,
					"tw": 0.01,
					"th": 0.01,
					"forbidden": true
				},
				"House 3": {
					"w": 0.01,
					"h": 0.01,
					"tx": 0,
					"ty": 0,
					"tw": 0.01,
					"th": 0.01,
					"forbidden": true
				},
				"Tree 1": {
					"w": 0.5,
					"h": 0.5,
					"tx": 0,
					"ty": 0,
					"tw": 0.5,
					"th": 0.5
				},
			}
		};

		var gui;

		var setup = function(args, ctx) {
			// Prevent right click in published
			ctx.domElement.addEventListener("contextmenu", function(e){
			    e.preventDefault();
			}, false);

			ctx.loaded = false;

			// Hijack the method
			goo.TerrainHandler.prototype.initLevel = function(terrainData, settings, forrestLODEntityMap) {
				this.settings = settings;
				var terrainSize = this.terrainSize;

				var promises = [];
				if(terrainData.heightMapPng){	
					console.log('LOADING HEIGHTS FROM PNG');
					var buffer = png2buffer(terrainData.heightMapPng);
					promises.push(goo.PromiseUtil.resolve(buffer));
				} else if(terrainData.heightMap){
					var terrainPromise = this._loadData(terrainData.heightMap);
					promises.push(terrainPromise);
				}
				
				if(terrainData.splatMapPng){
					console.log('LOADING SPLAT FROM PNG');
					var buffer = png2buffer(terrainData.splatMapPng);
					promises.push(goo.PromiseUtil.resolve(buffer));
				} else if(terrainData.splatMap){
					var splatPromise = this._loadData(terrainData.splatMap);
					promises.push(splatPromise);
				}
			
				return goo.rsvp.all(promises).then(function(datas) {
					var terrainBuffer = datas[0];
					var splatBuffer = datas[1];

					var terrainArray;
					if (terrainBuffer) {
						var bits = terrainData.heightMapBits || 32;
						var scale = terrainData.heightMapScale || 1;
						if (bits === 32) {
							terrainArray = new Float32Array(terrainBuffer);
							if (scale !== 1) {
								for (var i = 0; i < terrainSize * terrainSize; i++) {
									terrainArray[i] = terrainArray[i] * scale;
								}
							}
						} else if (bits === 16) {
							var uintBuffer = new Uint16Array(terrainBuffer);
							terrainArray = new Float32Array(terrainSize * terrainSize);
							for (var i = 0; i < terrainSize * terrainSize; i++) {
								terrainArray[i] = uintBuffer[i] * scale / 64;
							}
						}
					} else {
						terrainArray = new Float32Array(terrainSize * terrainSize);
					}

					var splatArray;
					if (splatBuffer) {
						splatArray = new Uint8Array(splatBuffer);
					} else {
						splatArray = new Uint8Array(terrainSize * terrainSize * 4 * 2 * 2);
					}

					return this._load(terrainData, terrainArray, splatArray, forrestLODEntityMap);
				}.bind(this));
			};

			// https://dl.dropboxusercontent.com/u/640317/terrain/terrainpack.js
			var resourceDir = 'https://dl.dropboxusercontent.com/u/640317/terrain/';
			var terrainHandler = new goo.TerrainHandler(ctx.world.gooRunner, args.heightmapSize, 8, resourceDir, args.static);
			ctx.terrainHandler = terrainHandler;
			
			var terrainEditSettings = {
				edit: false,
				mode: 'height',
				brush: 'flare.png',
				size: 20,
				power: 100,
				rgba: 'ground2',
				save: function(){
					//debugger
					var terrainSize = terrainHandler.terrainSize;
					var oldSplatMult = terrainHandler.terrain.splatMult;
					
					var terrainInfo = terrainHandler.terrain.getTerrainData();
					var terrainArray = terrainInfo.heights;
					
					var bits = terrainData.heightMapBits || 32;
					var scale = terrainData.heightMapScale || 1;
						
					var terrainBuffer;
					if (bits === 32) {
						terrainBuffer = terrainArray.buffer;
					} else if (bits === 16) {
						var uintBuffer = new Uint16Array(terrainSize * terrainSize);
						var min = 0;
						var max = 0;
						for (var i = 0; i < terrainSize * terrainSize; i++) {
							min = Math.min(terrainArray[i], min);
							max = Math.max(terrainArray[i], max);
							uintBuffer[i] = terrainArray[i] / scale * 64;
						}
						console.log('minmax', min, max);
						terrainBuffer = uintBuffer.buffer;
					}
					buffer2png(terrainBuffer, 'heightmap');
					
					var splatBuffer = terrainInfo.splat; // uint8
					buffer2png(splatBuffer.buffer, 'splatmap');
				}
			};

			var forrestLODMap = {};
			if (args.forrestEntity) {
				var forrestEntity = args.forrestEntity;
				var children = forrestEntity.children().toArray();
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					forrestLODMap[child.name] = child;
				}
			}
			
			if(args.gui){
				gui = new dat.GUI();
				
				var terrainFolder = gui.addFolder('Terrain');
				var editTerrain = terrainFolder.add(terrainEditSettings, 'edit');
				editTerrain.onFinishChange(function(value) {
					terrainHandler.toggleEditMode();
					// terrainHandler.updatePhysics();
					// terrainHandler.useLightmap(); // disables
					// goo.world.getSystem("GizmoRenderSystem").show(false);
				});
				
				terrainFolder.add(terrainEditSettings, 'mode', ['paint', 'height', 'smooth', 'flatten']);
				terrainFolder.add(terrainEditSettings, 'size').min(1);
				terrainFolder.add(terrainEditSettings, 'power', 1, 100);
				terrainFolder.add(terrainEditSettings, 'rgba', ['ground1', 'ground2', 'ground3', 'ground4', 'ground5']);
				terrainFolder.add(terrainEditSettings, 'save');

				terrainEditSettings.brushTexture = args.brush;
			}
			
			console.log('initLevel');

			terrainData.ground1.texture = args.ground1;
			terrainData.ground2.texture = args.ground2;
			terrainData.ground3.texture = args.ground3;
			terrainData.ground4.texture = args.ground4;
			terrainData.ground5.texture = args.ground5;
			terrainData.stone.texture = args.stone;
			terrainData.lightMap = args.lightMap;
			terrainData.normalMap = args.normalMap;

			terrainData.vegetationAtlas = args.vegetationAtlas;
			terrainData.forrestAtlas = args.forrestAtlas;
			terrainData.forrestAtlasNormals = args.forrestAtlasNormals;
			
			terrainData.heightMapScale = args.heightScale;
			
			if (args.heightMapPng) {
				terrainData.heightMapPng = args.heightMapPng._originalImage;
			}
			
			if (args.splatMapPng) {
				terrainData.splatMapPng = args.splatMapPng._originalImage;
			}
			
			terrainHandler.initLevel(terrainData, terrainEditSettings, forrestLODMap).then(function() {
				ctx.worldData.terrainLoaded = true;
				ctx.loaded = true;
			});
		};

		var cleanup = function(args, ctx, goo) {
			if (gui) {
				gui.destroy();
			}
			ctx.terrainHandler.cleanup();
		};

		var update = function(args, ctx, goo) {
			if (!ctx.loaded || !ctx.terrainHandler) {
				return;
			}
			
			var cameraEntity = ctx.activeCameraEntity;
			var pos = cameraEntity.transformComponent.transform.translation;
			var terrainHeight = ctx.terrainHandler.getHeightAt([pos.x, 0, pos.z]) + 3;
			pos.y = Math.max(pos.y, terrainHeight);
			// pos.y = terrainHandler.getHeightAt([pos.x, 0, pos.z]) + 5;
			cameraEntity.transformComponent.setUpdated();

			ctx.terrainHandler.update(cameraEntity);
		};

		var parameters = [
			{
				key: 'heightmapSize',
				type: 'int',
				default: 1024
			},
			{
				key: 'static',
				name: 'Static Terrain',
				type: 'boolean',
				default: false
			},
			{
				key: 'heightScale',
				name: 'Height Scale',
				type: 'float',
				default: 0.2
			},
			{
				key: 'ground1',
				name: 'ground1',
				type: 'texture'
			},
			{
				key: 'ground2',
				name: 'ground2',
				type: 'texture'
			},
			{
				key: 'ground3',
				name: 'ground3',
				type: 'texture'
			},
			{
				key: 'ground4',
				name: 'ground4',
				type: 'texture'
			},
			{
				key: 'ground5',
				name: 'ground5',
				type: 'texture'
			},
			{
				key: 'stone',
				name: 'stone',
				type: 'texture'
			},
			{
				key: 'lightMap',
				name: 'lightMap',
				type: 'texture'
			},
			{
				key: 'normalMap',
				name: 'normalMap',
				type: 'texture'
			},
			{
				key: 'vegetationAtlas',
				name: 'vegetationAtlas',
				type: 'texture'
			},
			{
				key: 'forrestAtlas',
				name: 'forrestAtlas',
				type: 'texture'
			},
			{
				key: 'forrestEntity',
				name: 'forrestEntity',
				type: 'entity'
			},
			{
				key: 'forrestAtlasNormals',
				name: 'forrestAtlasNormals',
				type: 'texture'
			},
			{
				key: 'brush',
				name: 'brush',
				type: 'texture'
			},
			{
				key: 'heightMapPng',
				type: 'texture'
			},
			{
				key: 'splatMapPng',
				type: 'texture'
			},
			{
				key: 'gui',
				type: 'boolean'
			}
		];
	};
*/
});

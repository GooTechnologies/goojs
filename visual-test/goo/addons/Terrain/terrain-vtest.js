require([
	'goo/renderer/Material',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'goo/renderer/Camera',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Texture',
	'goo/renderer/light/DirectionalLight',
	'goo/addons/waterpack/FlatWaterRenderer',
	'goo/addons/terrainpack/TerrainHandler',
	'goo/scriptpack/FlyControlScript',
	'goo/scripts/Scripts',
	'ColorUtil',
	'lib/V'
], function(
	Material,
	Box,
	Quad,
	TextureCreator,
	ShaderLib,
	ShaderBuilder,
	Vector3,
	MathUtils,
	Camera,
	MeshData,
	Shader,
	Texture,
	DirectionalLight,
	FlatWaterRenderer,
	TerrainHandler,
	FlyControlScript,
	Scripts,
	ColorUtil,
	V
) {
	'use strict';

	V.describe('The large quad should look like water, with ripples and a reflection of the skybox and the boxes above the quad\'s surface.');

	var terrainData = {
		"map_id": "legend01_map01",
		// "heightMap": "maps/legend01_map01_height.raw",
		// "heightMap": "maps/l3dt/l3dt1.raw",
		// "heightMapBits": 32, //32,
		// "heightMapScale": 0.1, //1,
		"heightMap": "maps/l3dt/heights16.raw",
		"heightMapBits": 16, //32,
		"heightMapScale": 0.2, //1,
		"splatMap": "maps/legend01_map01_splat.raw",
		// "splatMap": "maps/l3dt/splat.raw",
		"l3dtFolder": "maps/l3dt",
		"terrainConfig": "legend01",
		"ground1": {
			"texture": "images/legend_02/ground/grass_01.dds",
			"material": "ground_dirt_hit",
			"vegetation": {
				"grass_short_yellow_1": 0.39,
				"grass_short_green_1": 0.2,
				"grass_tall_3": 0.2,
				"grass_tall_4": 0.2,
				"thicket_1": 0.01
			},
			"forrest": {
				"rock_s_01": 0.4,
				"rock_s_02": 0.3,
				"rock_m_01": 0.05,
				"rock_m_02": 0.05
			}
		},
		"ground2": {
			"texture": "images/legend_02/ground/grass_02.dds",
			"material": "ground_grass_hit",
			"vegetation": {
				"grass_short_green_1": 0.3,
				"grass_short_green_2": 0.3,
				"grass_tall_1": 0.2,
				"grass_tall_2": 0.1,
				"nettles_1": 0.1
			},
			"forrest": {
				"tree_aspen_xs": 0.2,
				"tree_aspen_s": 0.05,
				"tree_spruce_xs": 0.2,
				"bush_aspen_l": 0.1,
				"bush_aspen_s": 0.05,
				"rock_s_01": 0.05,
				"rock_s_02": 0.05,
				"rock_m_01": 0.1,
				"rock_m_02": 0.1,
				"rock_l_01": 0.1
			}
		},
		"ground3": {
			"texture": "images/legend_02/ground/gravel_clay_debris_01.dds",
			"material": "ground_dirt_hit",
			"vegetation": {
				"grass_short_yellow_1": 0.3
			},
			"forrest": {
				"rock_s_01": 0.2,
				"rock_s_02": 0.2,
				"rock_m_01": 0.05
			}
		},
		"ground4": {
			"texture": "images/legend_02/ground/gravel_01.dds",
			"material": "ground_gravel_hit"
		},
		"ground5": {
			"texture": "images/legend_02/ground/grass_03.dds",
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
				"tree_aspen_xs": 0.2,
				"tree_aspen_s": 0.1,
				"tree_aspen_m": 0.05,
				"tree_aspen_l": 0.05,
				"tree_spruce_xs": 0.1,
				"tree_spruce_s": 0.2,
				"bush_aspen_l": 0.1,
				"bush_aspen_s": 0.1,
				"rock_s_01": 0.01,
				"rock_s_02": 0.01,
				"rock_m_01": 0.01,
				"rock_m_02": 0.02,
				"rock_l_01": 0.05
			}
		},
		"stone": {
			"texture": "images/legend_02/ground/stone_01.dds",
			"material": "ground_stone_hit"
		},
		"vegetationAtlas": "images/legend_02/vegetation/grass.dds",
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
		"forrestAtlas": "images/legend_02/vegetation/impostors_diffuse.dds",
		"forrestAtlasNormals": "images/legend_02/vegetation/impostors_normal.dds",
		"vegetationAlphaThreshold": 0.2,
		"forrestAlphaThreshold": 0.4,
		"forrestTypes": {
			"tree_aspen_xs": {
				"w": 7,
				"h": 7,
				"tx": 0.25,
				"ty": 0.25,
				"tw": 0.25,
				"th": 0.25
			},
			"tree_aspen_s": {
				"w": 14,
				"h": 22,
				"tx": 0.5,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.375
			},
			"tree_aspen_m": {
				"w": 13,
				"h": 26,
				"tx": 0.25,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.5
			},
			"tree_aspen_l": {
				"w": 13,
				"h": 26,
				"tx": 0,
				"ty": 0.5,
				"tw": 0.25,
				"th": 0.5
			},
			"tree_spruce_xs": {
				"w": 4,
				"h": 8,
				"tx": 0.875,
				"ty": 0.75,
				"tw": 0.125,
				"th": 0.25
			},
			"tree_spruce_s": {
				"w": 9,
				"h": 18,
				"tx": 0.5,
				"ty": 0,
				"tw": 0.25,
				"th": 0.5
			},
			"bush_aspen_l": {
				"w": 13,
				"h": 13,
				"tx": 0,
				"ty": 0.25,
				"tw": 0.25,
				"th": 0.25
			},
			"bush_aspen_s": {
				"w": 13,
				"h": 6,
				"tx": 0.5,
				"ty": 0.875,
				"tw": 0.25,
				"th": 0.125
			},
			"rock_s_01": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			},
			"rock_s_02": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			},
			"rock_m_01": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			},
			"rock_m_02": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			},
			"rock_l_01": {
				"w": 0.01,
				"h": 0.01,
				"tx": 0,
				"ty": 0,
				"tw": 0.01,
				"th": 0.01,
				"forbidden": true
			}
		}
	};

	var levelData = {
		"fog": {
			"enabled": true,
			"start": 20,
			"end": 500,
			"color": [
				1,
				1,
				1
			]
		},
		"gravity": 9.82,
		"skybox": "legend_03",
		"globalAmbient": [
			0.4607843137254902,
			0.4381968473663975,
			0.4381968473663975
		],
		"light": {
			"color": [
				1,
				1,
				1
			],
			"intensity": 1,
			"direction": [-0.9796721277050624,
				1.3460805416107178,
				0
			]
		},
		"lightmapSettings": {
			"ambient": 0.6,
			"occludableAmbientRatio": 0.3,
			"sunStrength": 0.8,
			"sunRayRatio": 0.3,
			"sunRaySpread": 0.05
		},
		"vegetationSettings": {
			"patchSize": 15,
			"patchDensity": 19
		}
	};

	function loadSkybox() {
		var environmentPath = 'resources/skybox/';
		// left, right, bottom, top, back, front
		var textureCube = new TextureCreator().loadTextureCube([
			environmentPath + '1.jpg',
			environmentPath + '3.jpg',
			environmentPath + '5.jpg',
			environmentPath + '6.jpg',
			environmentPath + '4.jpg',
			environmentPath + '2.jpg'
		]);
		skybox = createBox(skyboxShader, 10, 10, 10);
		skybox.meshRendererComponent.materials[0].setTexture(Shader.DIFFUSE_MAP, textureCube);
		skybox.meshRendererComponent.materials[0].cullState.cullFace = 'Front';
		skybox.meshRendererComponent.materials[0].depthState.enabled = false;
		skybox.meshRendererComponent.materials[0].renderQueue = 0;
		skybox.meshRendererComponent.cullMode = 'Never';
		skybox.addToWorld();

		goo.callbacksPreRender.push(function() {
			var source = cameraEntity.transformComponent.worldTransform;
			var target = skybox.transformComponent.worldTransform;
			target.translation.setVector(source.translation);
			target.update();
		});
	}

	function createBox(shader, w, h, d) {
		var meshData = new Box(w, h, d);
		var material = new Material(shader);
		return world.createEntity(meshData, material);
	}

	var skyboxShader = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',

			'varying vec3 eyeVec;',

			'void main(void) {',
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'	gl_Position = projectionMatrix * viewMatrix * worldPos;',
			'	eyeVec = cameraPosition - worldPos.xyz;',
			'}' //
		].join('\n'),
		fshader: [ //
			'precision mediump float;',

			'uniform samplerCube diffuseMap;',

			'varying vec3 eyeVec;',

			'void main(void)',
			'{',
			'	vec4 cube = textureCube(diffuseMap, eyeVec);',
			'	gl_FragColor = cube;',
			'}' //
		].join('\n')
	};

	var goo = V.initGoo();
	var world = goo.world;

	var skybox = null;

	var orbitScript = Scripts.create(FlyControlScript, {
		walkSpeed: 100,
		crawlSpeed: 20,
		// button: 'Right'
	});
	var camera = new Camera(80);
	var cameraEntity = goo.world.createEntity(camera, orbitScript, 'CameraEntity').addToWorld();
	cameraEntity.setTranslation(512, 180, 512);

	// V.addLights();
	var directionalLight = new DirectionalLight(new Vector3(1, 1, 0.9));
	directionalLight.intensity = 1;
	var lightEntity = goo.world.createEntity('directionalLight', directionalLight).addToWorld();
	lightEntity.setRotation(-Math.PI / 3, 0, 0);

	loadSkybox();

	var meshData = new Quad(10000, 10000, 10, 10);
	var material = new Material(ShaderLib.simple);
	var waterEntity = world.createEntity('Water', [512, -100, 512], meshData, material, function(entity) {
		// entity.setTransla3tion(0, Math.sin(world.time * 1) * 5, 0);
	}).setRotation([-Math.PI / 2, 0, 0]).addToWorld();

	var waterRenderer = new FlatWaterRenderer({
		normalsUrl: 'resources/water/waternormals3.png',
		useRefraction: false
	});
	goo.renderSystem.preRenderers.push(waterRenderer);

	waterRenderer.setWaterEntity(waterEntity);
	waterRenderer.setSkyBox(skybox);

	waterRenderer.waterMaterial.shader.uniforms.normalMultiplier = 1;
	waterRenderer.waterMaterial.shader.uniforms.fogColor = [1.0, 1.0, 1.0];
	waterRenderer.waterMaterial.shader.uniforms.fogStart = 0;


	var terrainHandler = new TerrainHandler(goo, 1024, 5, 'resources/');

	var forrestLODMap = {};
	var terrainEditSettings = {
		edit: false,
		mode: 'height',
		brush: 'flare.png',
		size: 20,
		power: 100,
		rgba: 'ground2'
	};

	var gui = new dat.GUI();

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
	TextureCreator.cache = [];

	var brushes = [
		"images/effects/flare.png",
		"images/effects/particle_chalk_smoke.dds",
		"images/effects/particle_clay_chard_medium.dds",
		"images/effects/particle_dirt.dds",
		"images/effects/particle_rifle_smoke.dds",
		"images/effects/particle_shot_wad.dds"
	];

	terrainEditSettings.brushTexture = new TextureCreator().loadTexture2D('resources/' + brushes[0]);
	var brush = terrainFolder.add(terrainEditSettings, 'brush', brushes);
	brush.onFinishChange(function(value) {
		terrainEditSettings.brushTexture = new TextureCreator().loadTexture2D('resources/' + value);
	});

	// LIGHTING
	var lighting = gui.addFolder('Lighting');
	var rot = lightEntity.getRotation();
	var direction = MathUtils.moduloPositive(rot.y * 180 / Math.PI, 360);
	var angle = -rot.x * 180 / Math.PI;
	var lightingobj = {
		direction: direction,
		angle: angle,
		intensity: levelData.light.intensity * 100,
		color: levelData.light.color.map(function(x) {
			return x * 255;
		}),
		ambient: levelData.globalAmbient.map(function(x) {
			return x * 255;
		})
	};
	var intensitySlider = lighting.add(lightingobj, 'intensity').min(0);
	intensitySlider.onChange(function(value) {
		lightEntity.lightComponent.light.intensity = value / 100;
		levelData.light.intensity = value / 100;
	});
	var directionSlider = lighting.add(lightingobj, 'direction', 0, 360);
	directionSlider.onChange(function(value) {
		var rot = lightEntity.getRotation();
		var rad = value * Math.PI / 180;
		lightEntity.transformComponent.transform.rotation.setIdentity();
		lightEntity.transformComponent.transform.rotation.rotateY(rad);
		lightEntity.transformComponent.transform.rotation.rotateX(rot.x);
		lightEntity.transformComponent.setUpdated();
		levelData.light.direction = [rot.x, rad, rot.z];
	});
	var angleSlider = lighting.add(lightingobj, 'angle', -90, 90);
	angleSlider.onChange(function(value) {
		var rot = lightEntity.getRotation();
		var rad = -value * Math.PI / 180;
		lightEntity.transformComponent.transform.rotation.setIdentity();
		lightEntity.transformComponent.transform.rotation.rotateY(rot.y);
		lightEntity.transformComponent.transform.rotation.rotateX(rad);
		lightEntity.transformComponent.setUpdated();
		levelData.light.direction = [rad, rot.y, rot.z];
	});
	var colorSetting = lighting.addColor(lightingobj, 'color');
	colorSetting.onChange(function(value) {
		var col;
		if (typeof value === 'string') {
			col = ColorUtil.cssToArray(value);
		} else {
			col = value.map(function(x) {
				return x / 255;
			});
		}
		lightEntity.lightComponent.light.color.setArray(col);
		levelData.light.color = col;
	});
	var ambientSetting = lighting.addColor(lightingobj, 'ambient');
	ambientSetting.onChange(function(value) {
		var col;
		if (typeof value === 'string') {
			col = ColorUtil.cssToArray(value);
		} else {
			col = value.map(function(x) {
				return x / 255;
			});
		}
		ShaderBuilder.GLOBAL_AMBIENT = col;
		levelData.globalAmbient = col;
	});

	// Set up lightmap settings if missing & add default values to missing values
	// if (levelData.lightmapSettings === undefined) {
	// 	levelData.lightmapSettings = {};
	// }
	// var defs = {
	// 	ambient: 0.6,
	// 	occludableAmbientRatio: 0.3,
	// 	sunStrength: 0.8,
	// 	sunRayRatio: 0.3,
	// 	sunRaySpread: 0.05
	// };
	// for (var x in defs) {
	// 	if (levelData.lightmapSettings[x] === undefined) {
	// 		levelData.lightmapSettings[x] = defs[x];
	// 	}
	// }

	// var lms = levelData.lightmapSettings;
	// var lightMapFolder = lighting.addFolder('Lightmap');
	// lightMapFolder.add(lms, 'ambient', 0, 1);
	// lightMapFolder.add(lms, 'occludableAmbientRatio', 0, 1);
	// lightMapFolder.add(lms, 'sunStrength', 0, 2);
	// lightMapFolder.add(lms, 'sunRayRatio', 0.1, 0.9);
	// lightMapFolder.add(lms, 'sunRaySpread', 0, 0.20);

	// FOG
	var fog = gui.addFolder('Fog');
	var fogEnabled = fog.add(levelData.fog, 'enabled');
	fogEnabled.onChange(function(value) {
		ShaderBuilder.USE_FOG = value;
	});
	var fogDistance1 = fog.add(levelData.fog, 'start', 0, 1000);
	fogDistance1.onChange(function(value) {
		ShaderBuilder.FOG_SETTINGS[0] = value;
	});
	var fogDistance2 = fog.add(levelData.fog, 'end', 0, 1000);
	fogDistance2.onChange(function(value) {
		ShaderBuilder.FOG_SETTINGS[1] = value;
	});
	var fogObj = {
		color: levelData.fog.color.map(function(x) {
			return x * 255;
		})
	};
	var fogColor = fog.addColor(fogObj, 'color');
	fogColor.onChange(function(value) {
		var col;
		if (typeof value === 'string') {
			col = ColorUtil.cssToArray(value);
		} else {
			col = value.map(function(x) {
				return x / 255;
			});
		}
		ShaderBuilder.FOG_COLOR = col;
		levelData.fog.color = col;
	});

	ShaderBuilder.USE_FOG = levelData.fog.enabled;
	ShaderBuilder.FOG_SETTINGS = [levelData.fog.start, levelData.fog.end];
	ShaderBuilder.FOG_COLOR = levelData.fog.color;

	// ShaderBuilder.GLOBAL_AMBIENT = [0.5, 0.5, 0.5];

	terrainHandler.initLevel(terrainData, terrainEditSettings, forrestLODMap).then(function() {

		// curLightmap = lightMapData;
		// if (curLightmap) {
		// var size = Math.sqrt(curLightmap.byteLength);
		// terrainHandler.useLightmap(new Uint8Array(curLightmap), size);
		// }

		// if (options.disableForrestLOD) {
		// terrainHandler.forrest.patchSize = 64;
		// terrainHandler.forrest.patchDensity = 5;
		// terrainHandler.forrest.gridSize = 7;
		// terrainHandler.forrest.minDist = 0;
		// }

		console.log("LOADED TERRAIN ", terrainHandler.terrain);
		console.log("HEIGHTMAP = ", terrainHandler.terrain.heightMap);

		goo.callbacks.push(function(tpf) {
			if (!goo.doProcess) {
				return;
			}

			var pos = cameraEntity.transformComponent.transform.translation;
			pos.y = Math.max(pos.y, terrainHandler.getHeightAt([pos.x, 0, pos.z]) + 1.5);

			terrainHandler.update(cameraEntity);
		});

		// goo._updateFrame(goo.start);

		// return skyboxPromise;
	}).then(function() {
		// SystemBus.emit('onLevelLoaded');
	});

	V.process();
});
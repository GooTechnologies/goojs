require([
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/entities/components/MovementComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/shapes/TerrainSurface',
	'goo/shapes/Sphere',
	'goo/scriptpack/WorldFittedTerrainScript',
	'goo/scriptpack/GroundBoundMovementScript',
	'goo/scripts/Scripts',
	'goo/renderer/TextureCreator',
	'goo/util/CanvasUtils',
	'lib/V',
	'goo/scriptpack/ScriptRegister'
], function (
	World,
	Material,
	ShaderLib,
	Camera,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	MovementComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent,
	TerrainSurface,
	Sphere,
	WorldFittedTerrainScript,
	GroundBoundMovementScript,
	Scripts,
	TextureCreator,
	CanvasUtils,
	V
	/* ScriptRegister */
	) {
	'use strict';

	var worldFittedTerrainScript = new WorldFittedTerrainScript();

	var randomWalk = function(groundBoundMovementScript) {
		function applySelection(selection) {
			switch (selection) {
				case 1:
					groundBoundMovementScript.applyForward(Math.round(1 - V.rng.nextFloat() * 2));
					break;
				case 2:
					groundBoundMovementScript.applyStrafe(Math.round(1 - V.rng.nextFloat() * 2));
					break;
				case 3:
					groundBoundMovementScript.applyJump(1);
					break;
				case 4:
					groundBoundMovementScript.applyTurn(1 - V.rng.nextFloat() * 2);
					break;
			}

			setTimeout(function() {
				selection = Math.ceil(V.rng.nextFloat() * V.rng.nextFloat() * 4);
				applySelection(selection);
			}, 1000 + V.rng.nextFloat() * 2000);
		}
		applySelection(3);
	};

	function addMovementToEntity(entity, terrainScript, movementProperties) {
		entity.setComponent(new MovementComponent());
		var groundBoundMovementScript = new GroundBoundMovementScript(movementProperties);
		groundBoundMovementScript.setTerrainSystem(terrainScript);
		var scripts = new ScriptComponent();
		scripts.scripts.push(groundBoundMovementScript);
		entity.setComponent(scripts);
		entity.addToWorld();
		randomWalk(groundBoundMovementScript);
	}

	function addSpheres(goo, worldFittedTerrainScript, dims) {
		/*jshint loopfunc: true */
		var meshData = new Sphere(32, 32);

		var nSpheres = 4;
		var ak = Math.PI * 2 / nSpheres;
		for (var i = 0, k = 0; i < nSpheres; i++, k += ak) {
			var material = new Material(ShaderLib.simpleColored, '');
			material.uniforms.color = [
				Math.cos(k) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 2) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 4) * 0.5 + 0.5
			];
			var sphereEntity = goo.world.createEntity(meshData, material);
			sphereEntity.transformComponent.transform.translation.setd(i+dims.minX*0.5+dims.maxX*0.5, dims.maxY*0.5+dims.minY*0.5, dims.maxZ*0.5+dims.minZ*0.5);
			sphereEntity.transformComponent.transform.scale.setd(2, 3, 5);
			addMovementToEntity(sphereEntity, worldFittedTerrainScript);
		}
	}

	function addCar(goo, worldFittedTerrainScript, dims) {
		/*jshint loopfunc: true */
		var meshData = new Sphere(32, 32);

		var material = new Material(ShaderLib.simpleLit, '');
		material.uniforms.color = [0.98, 0.6, 0.2];

		var rootEntity = goo.world.createEntity(meshData, material);
		rootEntity.transformComponent.transform.translation.setd(dims.minX*0.5+dims.maxX*0.5, dims.maxY*0.5+dims.minY*0.5, dims.maxZ*0.5+dims.minZ*0.5);
		rootEntity.transformComponent.transform.scale.setd(1, 1, 1);

		var body = goo.world.createEntity(meshData, material);
		body.transformComponent.transform.translation.setd(0,0.7,0);
		body.transformComponent.transform.scale.setd(2.2, 1.4, 5);
		rootEntity.transformComponent.attachChild(body.transformComponent);

		var wheel1 = goo.world.createEntity(meshData, material);
		wheel1.transformComponent.transform.translation.setd(1,0.4,2.0);
		wheel1.transformComponent.transform.scale.setd(0.3, 1, 1);
		rootEntity.transformComponent.attachChild(wheel1.transformComponent);

		var wheel2 = goo.world.createEntity(meshData, material);
		wheel2.transformComponent.transform.translation.setd(-1,0.4,2.0);
		wheel2.transformComponent.transform.scale.setd(0.3, 1, 1);
		rootEntity.transformComponent.attachChild(wheel2.transformComponent);

		var wheel3 = goo.world.createEntity(meshData, material);
		wheel3.transformComponent.transform.translation.setd(1,0.4,-2.0);
		wheel3.transformComponent.transform.scale.setd(0.3, 1, 1);
		rootEntity.transformComponent.attachChild(wheel3.transformComponent);

		var wheel4 = goo.world.createEntity(meshData, material);
		wheel4.transformComponent.transform.translation.setd(-1,0.4,-2.0);
		wheel4.transformComponent.transform.scale.setd(0.3, 1, 1);
		rootEntity.transformComponent.attachChild(wheel4.transformComponent);

		var light1 = goo.world.createEntity(meshData, material);
		light1.transformComponent.transform.translation.setd(0.8,1, 2.4);
		light1.transformComponent.transform.scale.setd(0.5, 0.5, 0.5);
		rootEntity.transformComponent.attachChild(light1.transformComponent);

		var light2 = goo.world.createEntity(meshData, material);
		light2.transformComponent.transform.translation.setd(-0.8,1, 2.4);
		light2.transformComponent.transform.scale.setd(0.5, 0.5, 0.5);
		rootEntity.transformComponent.attachChild(light2.transformComponent);

		var coup = goo.world.createEntity(meshData, material);
		coup.transformComponent.transform.translation.setd(0,0.6,-0.12);
		coup.transformComponent.transform.scale.setd(0.8, 1.3, 0.4);
		body.transformComponent.attachChild(coup.transformComponent);

		var movementProperties = {
			modStrafe:4,
			modForward:27,
			modBack:3,
			modturn:0.7,
			accLerp:0.01,
			rotLerp:0.4
		};

		addMovementToEntity(rootEntity, worldFittedTerrainScript, movementProperties);
	}


	function addBiped(goo, worldFittedTerrainScript, dims) {
		/*jshint loopfunc: true */
		var meshData = new Sphere(32, 32);

		var material = new Material(ShaderLib.simpleLit, '');
		material.uniforms.color = [0.98, 0.6, 0.2];

		var rootEntity = goo.world.createEntity(meshData, material);
		rootEntity.transformComponent.transform.translation.setd(dims.minX*0.5+dims.maxX*0.5, dims.maxY*0.5+dims.minY*0.5, dims.maxZ*0.5+dims.minZ*0.5);
		rootEntity.transformComponent.transform.scale.setd(1, 1, 1);

		var chest = goo.world.createEntity(meshData, material);
		chest.transformComponent.transform.translation.setd(0,1.5,0);
		chest.transformComponent.transform.scale.setd(1.7, 1.6, 1.3);
		rootEntity.transformComponent.attachChild(chest.transformComponent);

		var armr = goo.world.createEntity(meshData, material);
		armr.transformComponent.transform.translation.setd(-0.6,-0.2,-0.1);
		armr.transformComponent.transform.scale.setd(0.3, 0.9, 0.3);
		chest.transformComponent.attachChild(armr.transformComponent);

		var arml = goo.world.createEntity(meshData, material);
		arml.transformComponent.transform.translation.setd(0.6,-0.2,-0.1);
		arml.transformComponent.transform.scale.setd(0.3, 0.9, 0.3);
		chest.transformComponent.attachChild(arml.transformComponent);

		var head = goo.world.createEntity(meshData, material);
		head.transformComponent.transform.translation.setd(0,2.6,0);
		head.transformComponent.transform.scale.setd(0.8, 0.8, 0.8);
		rootEntity.transformComponent.attachChild(head.transformComponent);

		var nose = goo.world.createEntity(meshData, material);
		nose.transformComponent.transform.translation.setd(0,0,0.7);
		nose.transformComponent.transform.scale.setd(0.5, 0.5, 0.5);
		head.transformComponent.attachChild(nose.transformComponent);

		addMovementToEntity(rootEntity, worldFittedTerrainScript);
	}

	function addLight(dims) {
		var light1 = new PointLight();
		light1.color.set(0.8, 0.7,0.61);
		var light1Entity = goo.world.createEntity('light');
		light1Entity.setComponent(new LightComponent(light1));
		light1Entity.transformComponent.transform.translation.set( dims.minX*0.5+dims.maxX*0.50, 20+dims.maxY, dims.maxZ*0.5+dims.minZ*0.5);
		light1Entity.addToWorld();
	}

	function buildTexturedGround(matrix, dimensions, id, gooWorld, txPath) {
		var meshData = new TerrainSurface(matrix, dimensions.maxX-dimensions.minX, dimensions.maxY-dimensions.minY, dimensions.maxZ-dimensions.minZ);
		var material = new Material(ShaderLib.texturedLit, '');

		var texture = new TextureCreator().loadTexture2D(txPath);
		material.setTexture('DIFFUSE_MAP', texture);

		material.uniforms.materialAmbient = [
			0.310305785123966943,
			0.310305785123966943,
			0.386363636363636367,
			1
		];
		material.uniforms.materialDiffuse = [
			0.25909090909090909,
			0.24909090909090909,
			0.29909090909090909,
			1
		];

		material.cullState.cullFace = "Back";
		//      material.cullState.enabled = false;
		//    emissive: materialData.uniforms.materialEmissive,
		material.uniforms.materialSpecular = [0.0, 0.0, 0.0, 1];
		material.uniforms.materialEmissive = [0, 0, 0, 1];
		material.uniforms.materialSpecularPower = 0.1;

		var surfaceEntity = gooWorld.createEntity(meshData, material, id);
		surfaceEntity.transformComponent.transform.translation.setd(dimensions.minX, dimensions.minY, dimensions.minZ);
		surfaceEntity.transformComponent.setUpdated();
		surfaceEntity.addToWorld();
	}
/*
	function buildSurfaceMesh(matrix, dimensions, id, gooWorld) {
		var meshData =  new TerrainSurface(matrix, dimensions.maxX-dimensions.minX, dimensions.maxY-dimensions.minY, dimensions.maxZ-dimensions.minZ);
		var material = new Material(ShaderLib.simpleLit, '');
		material.wireframe = true;
		var surfaceEntity = EntityUtils.createTypicalEntity(gooWorld, meshData, material, id);
		surfaceEntity.transformComponent.transform.translation.setd(dimensions.minX, dimensions.minY, dimensions.minZ);
		surfaceEntity.transformComponent.setUpdated();
		surfaceEntity.addToWorld();
	}
 */
	function groundBoundMovementScriptDemo() {
		CanvasUtils.loadCanvasFromPath('../../../resources/heightmap_walled.png', function(canvas) {
			var matrix = CanvasUtils.getMatrixFromCanvas(canvas);

			var dim1 = {
				minX: -150,
				maxX: 150,
				minY: -55,
				maxY: -15,
				minZ: -150,
				maxZ: 150
			};

			var terrainData1 = worldFittedTerrainScript.addHeightData(matrix, dim1);

		//	buildSurfaceMesh(terrainData1.script.matrixData, terrainData1.dimensions, "terrain_mesh_1", goo.world);
			buildTexturedGround(terrainData1.script.matrixData, terrainData1.dimensions, "terrain_mesh_1", goo.world, '../../../resources/heightmap_walled.png');


			addSpheres(goo, worldFittedTerrainScript, dim1);
			addBiped(goo, worldFittedTerrainScript, dim1);
			addCar(goo, worldFittedTerrainScript, dim1);
			addCar(goo, worldFittedTerrainScript, dim1);
			addCar(goo, worldFittedTerrainScript, dim1);
			addCar(goo, worldFittedTerrainScript, dim1);
			addLight(dim1);

			// Add camera
			var camera = new Camera(45, 1, 1, 1000);
			var cameraEntity = goo.world.createEntity("CameraEntity");
			cameraEntity.transformComponent.transform.translation.set(0, 50, 90);
			cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
			cameraEntity.setComponent(new CameraComponent(camera));
			cameraEntity.addToWorld();

			// Camera control set up
			var scripts = new ScriptComponent();
			scripts.scripts.push(Scripts.create('WASD', {
				domElement : goo.renderer.domElement,
				walkSpeed : 25.0,
				crawlSpeed : 10.0
			}));
			scripts.scripts.push(Scripts.create('MouseLookScript', {
				domElement : goo.renderer.domElement
			}));
			scripts.scripts.push(worldFittedTerrainScript);
			cameraEntity.setComponent(scripts);
		});

		CanvasUtils.loadCanvasFromPath('../../../resources/checker_slope.png', function(canvas) {
			var matrix = CanvasUtils.getMatrixFromCanvas(canvas);

			var dim = {
				minX: -20,
				maxX: 0,
				minY: 25,
				maxY: 28,
				minZ: -20,
				maxZ: 0
			};

			var terrainData = worldFittedTerrainScript.addHeightData(matrix, dim);
				buildTexturedGround(terrainData.script.matrixData, terrainData.dimensions, "terrain_mesh_5", goo.world, '../../../resources/check.png');
			//	buildSurfaceMesh(terrainData.script.matrixData, terrainData.dimensions, "terrain_mesh_5", goo.world);
			addSpheres(goo, worldFittedTerrainScript, dim);
			addLight(dim);
		});

	}

	var goo = V.initGoo();
	var world = goo.world;

	groundBoundMovementScriptDemo();
});

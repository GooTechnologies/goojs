require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/entities/components/CameraComponent',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/entities/components/TransformComponent',
	'goo/addons/cannonpack/CannonSystem',
	'goo/addons/cannonpack/CannonRigidbodyComponent',
	'goo/addons/cannonpack/CannonSphereColliderComponent',
	'goo/addons/cannonpack/CannonBoxColliderComponent',
	'goo/addons/cannonpack/CannonTerrainColliderComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/geometrypack/Surface',
	'lib/V'
], function (
	GooRunner,
	Material,
	Camera,
	Box,
	Sphere,
	Quad,
	CameraComponent,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	Quaternion,
	TransformComponent,
	CannonSystem,
	CannonRigidbodyComponent,
	CannonSphereColliderComponent,
	CannonBoxColliderComponent,
	CannonTerrainColliderComponent,
	PointLight,
	LightComponent,
	Surface,
	V
) {
	'use strict';

	var start = Date.now();
	var nLin = 100,
		nCol = 30,
		elementSize = 0.5,
		boxEntity;

	var goo = V.initGoo();

	var cannonSystem = new CannonSystem({
		gravity: new Vector3(0, -10, 0),
		maxSubSteps: 3,
	});
	goo.world.setSystem(cannonSystem);

	init();

	function addBox(x, y, z) {
		var material = V.getColoredMaterial();
		var radius = 1;
		var meshData = new Sphere(8, 8, radius);
		boxEntity = goo.world.createEntity(meshData, material, [x, y, z]).addToWorld();
		boxEntity.setComponent(new CannonRigidbodyComponent({
			mass: 1
		}));
		boxEntity.setComponent(new CannonSphereColliderComponent({ radius: radius }));
	}

	function getMatrix(flip) {
		var matrix = [];
		var m = Math.cos((Date.now() - start) / 1000 * 0.05);
		var a = m * 0.2;
		var b = m * 0.2;
		//var c = m * 0.4;
		for (var i = 0; i < nLin; i++) {
			matrix.push([]);
			for (var j = 0; j < nCol; j++) {
				var value = Math.sin(i * a) * Math.cos(j * b) + 1;
				//value = i * 0.1;
				//value = (nLin - i -1) * 0.1;
				//value = (nCol - j - 1) * 0.1;
				//value = j * 0.1;
				matrix[i].push(value);
			}
		}
		return matrix;
	}

	var entity;
	var colliderEntity;
	function addTerrain() {
		var matrix = getMatrix();
		var meshData = Surface.createFromHeightMap(matrix, elementSize, 1, elementSize);
		var material = V.getColoredMaterial();

		entity = goo.world.createEntity([0, -2, 0]).addToWorld();
		entity.setComponent(new CannonRigidbodyComponent({
			mass: 0 // static
		}));

		var meshEntity = goo.world.createEntity(meshData, material, [-(nCol - 1) / 2 * elementSize, 0, -(nLin - 1) / 2 * elementSize]).addToWorld();
		entity.attachChild(meshEntity);

		// Cannon terrain is facing in Z direction. Move it to center and rotate to compensate.
		colliderEntity = goo.world.createEntity([-(nLin - 1) / 2 * elementSize, -(nCol - 1) / 2 * elementSize, 0]);
		colliderEntity.setRotation(-Math.PI / 2, -Math.PI / 2, 0);
		colliderEntity.addToWorld();
		var terrainColliderComp = new CannonTerrainColliderComponent({
			data: getMatrix(true),
			shapeOptions: {
				elementSize: elementSize
			}
		});
		colliderEntity.setComponent(terrainColliderComp);
		entity.attachChild(colliderEntity);
	}

	// function updateTerrain() {
	// 	var matrix = getMatrix();
	// 	var collider = colliderEntity.colliderComponent.collider;
	// 	collider.setFromHeightMap(matrix);
	// 	entity.ammoWorkerRigidbodyComponent.updateCollider(colliderEntity);
	// 	var meshData = Surface.createFromHeightMap(matrix);
	// 	entity.meshDataComponent.meshData = meshData;
	// }

	function init() {
		addTerrain();
		addBox(0, 4, 0);
		V.addLights();
		V.addOrbitCamera([50, 0, 0]);
		/*
		goo.callbacks.push(function () {
			updateTerrain();
			boxEntity.ammoWorkerRigidbodyComponent.activate();
		});
		*/
	}
});

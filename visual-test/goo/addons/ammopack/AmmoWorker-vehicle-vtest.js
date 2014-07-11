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
	'goo/addons/ammopack/AmmoWorkerSystem',
	'goo/addons/ammopack/AmmoWorkerRigidbodyComponent',
	'goo/addons/ammopack/SphereCollider',
	'goo/addons/ammopack/BoxCollider',
	'goo/addons/ammopack/CapsuleCollider',
	'goo/addons/ammopack/PlaneCollider',
	'goo/addons/ammopack/TerrainCollider',
	'goo/addons/ammopack/ColliderComponent',
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
	AmmoWorkerSystem,
	AmmoWorkerRigidbodyComponent,
	SphereCollider,
	BoxCollider,
	CapsuleCollider,
	PlaneCollider,
	TerrainCollider,
	ColliderComponent,
	PointLight,
	LightComponent,
	Surface,
	V
) {
	'use strict';

	var nLin = 64;
	var nCol = 64;
	var width = 100;
	var length = 100;

	var goo = V.initGoo();

	var workerUrl = '../../../../lib/ammo_worker.js';
	var ammoUrl = window.location.href.replace(/\/[^\/]*$/, '') + '/../../../../lib/ammo.small.js';

	if (localStorage.gooPath) {
		workerUrl = localStorage.gooPath + '/addons/ammopack/ammo_worker.js';
	}
	var ammoWorkerSystem = new AmmoWorkerSystem({
		gravity: new Vector3(0, -10, 0),
		maxSubSteps: 1,
		workerUrl: workerUrl,
		ammoUrl: ammoUrl
	});
	goo.world.setSystem(ammoWorkerSystem);

	init();

	var boxEntity;
	function addGround() {
		var material = V.getColoredMaterial();
		var meshData = new Box(500, 0.1, 500);
		boxEntity = goo.world.createEntity(meshData, material, [0, -2, 0]).addToWorld();
		boxEntity.setRotation(0, 0, 0);
		boxEntity.setComponent(new AmmoWorkerRigidbodyComponent({
			mass: 0
		}));
		boxEntity.setComponent(new ColliderComponent(new BoxCollider({
			halfExtents: new Vector3(meshData.xExtent, meshData.yExtent, meshData.zExtent)
		})));
	}

	/*
	var boxEntity2;
	function addBox() {
		var material = V.getColoredMaterial();
		var meshData = new Box(width, 1, length);
		boxEntity2 = goo.world.createEntity(meshData, material, [0, 0, 0]).addToWorld();
	}
	*/

	function getMatrix() {
		var matrix = [];
		var m = 1;
		var a = m * 0.2;
		var b = m * 0.2;
		var c = m * 0.4;
		for (var i = 0; i < nLin; i++) {
			matrix.push([]);
			for (var j = 0; j < nCol; j++) {
				var value =
					Math.sin(i * a); +
					Math.cos(j * b) +
					Math.sin(Math.sqrt(i * i + j * j) * c) * 1;
				//value = 0;
				value = Math.cos(3 * i * b);
				matrix[i].push(value);
			}
		}
		return matrix;
	}

	var entity;
	var colliderEntity;
	function addTerrain() {
		var matrix = getMatrix();
		var xScale = width / (nLin - 1);
		var zScale = length / (nCol - 1);
		var meshData = Surface.createFromHeightMap(matrix, xScale, 1, zScale);
		var material = V.getColoredMaterial();
		entity = goo.world.createEntity(meshData, material, [ - width / 2, -5, - length / 2]).addToWorld();

		entity.setComponent(new AmmoWorkerRigidbodyComponent({
			mass: 0 // static
		}));

		colliderEntity = goo.world.createEntity();
		colliderEntity.addToWorld();
		entity.attachChild(colliderEntity);
		colliderEntity.transformComponent.transform.translation.setd(width / 2, 0, length / 2);
		colliderEntity.transformComponent.setUpdated();
		colliderEntity.setComponent(new ColliderComponent(new TerrainCollider({
			heightMap: matrix,
			width: width,
			length: length
		})));
	}

	var keys = {
		'37': 0,
		'38': 0,
		'39': 0,
		'40': 0,
	};
	var vehicleEntity;
	var engineSpeed = 500;
	function addVehicle() {
		var material = V.getColoredMaterial();
		var meshData = new Box(2, 1, 4);

		vehicleEntity = goo.world.createEntity(meshData, material, [0, 2, 0]).addToWorld();
		vehicleEntity.setComponent(new ColliderComponent(new BoxCollider({ halfExtents: new Vector3(meshData.xExtent, meshData.yExtent, meshData.zExtent) })));
		vehicleEntity.setComponent(new AmmoWorkerRigidbodyComponent({
			mass: 150
		}));
		vehicleEntity.ammoWorkerRigidbodyComponent.enableVehicle();
		var maxSteering = Math.PI * 0.01;
		goo.callbacks.push(function () {
			var engine = keys[38] * engineSpeed + keys[40] * -engineSpeed;
			var steering = keys[37] * 0.3 + keys[39] * (-0.3);
			vehicleEntity.ammoWorkerRigidbodyComponent.setVehicleEngineForce(engine);
			vehicleEntity.ammoWorkerRigidbodyComponent.setVehicleSteeringValue(steering);
		});
	}

	function keyhandler(event) {
		keys[event.keyCode] = (event.type === 'keyup' ? 0 : 1);
	}
	document.addEventListener('keydown', keyhandler);
	document.addEventListener('keyup', keyhandler);

	function init() {
		//addGround();
		//addBox()
		addTerrain();
		addVehicle();
		V.addLights();
		V.addOrbitCamera([50, 0, 0]);
	}
});
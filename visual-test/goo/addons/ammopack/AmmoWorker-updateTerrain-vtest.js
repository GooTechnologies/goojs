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

	var nLin = 64,
		nCol = 64,
		boxEntity;

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

	function addBox() {
		var material = V.getColoredMaterial();
		var meshData = new Box(1, 1, 1);
		boxEntity = goo.world.createEntity(meshData, material, [0, 2, 0]).addToWorld();
		boxEntity.setComponent(new AmmoWorkerRigidbodyComponent({
			mass: 1
		}));
		boxEntity.setComponent(new ColliderComponent(new BoxCollider(new Vector3(0.5, 0.5, 0.5))));
	}

	var start = Date.now();
	function getMatrix() {
		var matrix = [];
		var m = Math.cos((Date.now() - start) / 1000 * 0.05);
		var a = m * 0.2;
		var b = m * 0.2;
		var c = m * 0.4;
		for (var i = 0; i < nLin; i++) {
			matrix.push([]);
			for (var j = 0; j < nCol; j++) {
				var value =
					Math.sin(i * a) +
					Math.cos(j * b) +
					Math.sin(Math.sqrt(i * i + j * j) * c) * 2;
				matrix[i].push(value);
			}
		}
		return matrix;
	}

	var entity;
	var colliderEntity;
	function addTerrain() {
		var matrix = getMatrix();
		var meshData = Surface.createFromHeightMap(matrix);
		var material = V.getColoredMaterial();
		entity = goo.world.createEntity(meshData, material, [-nLin / 2, -5, -nCol / 2]).addToWorld();

		entity.setComponent(new AmmoWorkerRigidbodyComponent({
			mass: 0 // static
		}));

		colliderEntity = goo.world.createEntity();
		colliderEntity.addToWorld();
		entity.attachChild(colliderEntity);
		colliderEntity.transformComponent.transform.translation.setd((nLin) / 2, 0, (nCol) / 2);
		colliderEntity.transformComponent.setUpdated();
		colliderEntity.setComponent(new ColliderComponent(new TerrainCollider({
			heightMap: matrix
		})));
		colliderEntity.colliderComponent.collider.minHeight = -2;
		colliderEntity.colliderComponent.collider.maxHeight = 2;
	}

	function updateTerrain() {
		var matrix = getMatrix();
		var collider = colliderEntity.colliderComponent.collider;
		collider.setFromHeightMap(matrix);
		collider.minHeight = -2;
		collider.maxHeight = 2;
		entity.ammoWorkerRigidbodyComponent.updateCollider(colliderEntity);
		var meshData = Surface.createFromHeightMap(matrix);
		entity.meshDataComponent.meshData = meshData;
	}

	function init() {
		addTerrain();
		addBox();
		V.addLights();
		V.addOrbitCamera([50, 0, 0]);
		goo.callbacks.push(function () {
			updateTerrain();
			boxEntity.ammoWorkerRigidbodyComponent.activate();
		});
	}
});
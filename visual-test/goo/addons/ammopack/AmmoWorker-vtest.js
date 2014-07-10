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
	'goo/addons/ammopack/AmmoSphereColliderComponent',
	'goo/addons/ammopack/AmmoBoxColliderComponent',
	'goo/addons/ammopack/AmmoCapsuleColliderComponent',
	'goo/addons/ammopack/AmmoPlaneColliderComponent',
	'goo/addons/ammopack/AmmoTerrainColliderComponent',
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
	AmmoSphereColliderComponent,
	AmmoBoxColliderComponent,
	AmmoCapsuleColliderComponent,
	AmmoPlaneColliderComponent,
	AmmoTerrainColliderComponent,
	PointLight,
	LightComponent,
	Surface,
	V
) {
	'use strict';

	var goo = V.initGoo();
	var intervals = [];

	var workerUrl = '../../../../lib/ammo_worker.js';
	var ammoUrl = '../../../../lib/ammo.small.js';
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

	function createEntity(goo, meshData, ammoSettings, pos, colliderComponent, material, name) {
		material = material || V.getColoredMaterial();
		var entity = goo.world.createEntity(meshData, material, pos);
		entity.addToWorld();
		entity.setComponent(colliderComponent);
		entity.setComponent(new AmmoWorkerRigidbodyComponent(ammoSettings));
		if (name) {
			entity.name = name;
		}
		return entity;
	}

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var x = V.rng.nextFloat() * 16 - 8;
			var y = V.rng.nextFloat() * 16 + 8;
			var z = V.rng.nextFloat() * 16 - 8;
			if (V.rng.nextFloat() < 0.5) {
				var h = new Vector3(0.5 + V.rng.nextFloat(), 0.5 + V.rng.nextFloat(), 0.5 + V.rng.nextFloat());
				createEntity(goo, new Box(2 * h.x, 2 * h.y, 2 * h.z),
					{mass: 1},
					[x, y, z],
					new AmmoBoxColliderComponent({
						halfExtents : h
					}),
					null,
					'primitive box');
			} else {
				var radius = 1 + V.rng.nextFloat();
				createEntity(goo, new Sphere(10, 10, radius),
					{mass: 1},
					[x, y, z],
					new AmmoSphereColliderComponent({
						radius : radius
					}),
					null,
					'primitive sphere'
				);
			}
		}
	}

	function rayCast() {
		var start = new Vector3(0, 100, 0);
		var end = new Vector3(0, -100, 0);
		ammoWorkerSystem.rayCast(start, end).then(function (result) {
			console.log(result.entity.name);
		});
	}

	function addTerrain() {
		var nLin = 64, nCol = 64;
		var matrix = [];
		for (var i = 0; i < nLin; i++) {
			matrix.push([]);
			for (var j = 0; j < nCol; j++) {
				var value =
					Math.sin(i * 0.1) +
					Math.cos(j * 0.1) +
					Math.sin(Math.sqrt(i * i + j * j) * 0.3) * 2;
				matrix[i].push(value);
			}
		}
		var meshData = Surface.createFromHeightMap(matrix);
		var material = V.getColoredMaterial();
		var entity = goo.world.createEntity(meshData, material, [-nLin / 2, -5, -nCol / 2]).addToWorld();
		entity.setComponent(new AmmoWorkerRigidbodyComponent({
			mass: 0 // static
		}));
		entity.name = 'terrain';

		var colliderEntity = goo.world.createEntity();
		colliderEntity.addToWorld();
		entity.attachChild(colliderEntity);
		colliderEntity.transformComponent.transform.translation.setd((nLin) / 2, 0, (nCol) / 2);
		colliderEntity.transformComponent.setUpdated();
		colliderEntity.setComponent(new AmmoTerrainColliderComponent({
			heightMap: matrix
		}));
	}

	function setVelocity() {
		var h = new Vector3(0.5, 0.5, 0.5);
		var entity = createEntity(goo, new Box(2 * h.x, 2 * h.y, 2 * h.z),
			{ mass: 1 },
			[0, 3, 0],
			new AmmoBoxColliderComponent({
				halfExtents : h
			})
		);
		entity.setLinearVelocity(new Vector3(0, 20, 0));
		entity.setAngularVelocity(new Vector3(20, 0, 0));
	}

	function addKinematic() {
		var h = new Vector3(4, 1, 4);
		var pos = [0, 3, -10];
		var entity = createEntity(goo, new Box(2 * h.x, 2 * h.y, 2 * h.z),
			{ mass: 1, type: AmmoWorkerRigidbodyComponent.KINEMATIC },
			pos,
			new AmmoBoxColliderComponent({
				halfExtents : h
			})
		);

		pos[1] += 2;
		createEntity(goo, new Box(2, 2, 2), {mass: 1}, pos,  new AmmoBoxColliderComponent({ halfExtents: new Vector3(1, 1, 1) }));

		var sign = 1;
		function func() {
			entity.setLinearVelocity(new Vector3(sign * 3, 0, 0));
			entity.setAngularVelocity(new Vector3(0, sign * 2, 0)); // Does not work yet
			sign *= -1;
		}
		intervals.push(setInterval(func, 4000));
		func();
	}

	var characterEntity;
	function addCharacter() {
		var pos = [20, 3, -10];
		var entity = characterEntity = createEntity(goo, new Sphere(10, 10, 1),
			{ mass: 1, friction: 0.3 },
			pos,
			new AmmoSphereColliderComponent({
				radius : 1
			})
		);
		entity.ammoWorkerRigidbodyComponent.enableCharacterController(new Vector3(0, -1.5, 0));
	}

	var addRemoveEntity;
	function addRemove() {
		if (!addRemoveEntity) {
			var h = new Vector3(1, 1, 1);
			addRemoveEntity = createEntity(goo, new Box(2 * h.x, 2 * h.y, 2 * h.z),
				{ mass: 1 },
				[0, 3, 0],
				new AmmoBoxColliderComponent({
					halfExtents : h
				})
			);
		} else {
			addRemoveEntity.removeFromWorld();
			addRemoveEntity = undefined;
		}
	}

	function setPosition() {
		if (addRemoveEntity) {
			addRemoveEntity.setCenterOfMassTransform(new Vector3(3, 3, 3), new Quaternion());
		} else {
			addRemove();
		}
	}

	var cleared = false;
	function reset() {
		if (cleared) {
			init();
			ammoWorkerSystem.run();
		} else {
			while(intervals.length){
				clearInterval(intervals.pop());
			}
			// Remove all entities from the world
			var entities = goo.world.entityManager.getEntities();
			for (var i = 0; i < entities.length; i++) {
				entities[i].removeFromWorld();
			}
			ammoWorkerSystem.clear();
		}
		cleared = !cleared;
	}

	var paused = false;
	function playPause() {
		if (paused) {
			ammoWorkerSystem.run();
		} else {
			ammoWorkerSystem.pause();
		}
		paused = !paused;
	}

	function init() {
		addPrimitives();
		addKinematic();
		addTerrain();
		addCharacter();
		addOther();

		setTimeout(function () {
			rayCast();
		}, 10);
	}

	console.log([
		'a: add primitives',
		'v: set velocity',
		'r: add/remove body',
		'm: set position (move)',
		'p: play/pause simulation'
	].join('\n'));

	function keyhandler(event) {
		var speed = 4;
		if (event.type === 'keyup') {
			speed = 0;
		}
		switch (event.keyCode) {
		case 37: // left
			characterEntity.ammoWorkerRigidbodyComponent.setCharacterVelocity(new Vector3(0, 0, speed));
			break;
		case 38: // up
			characterEntity.ammoWorkerRigidbodyComponent.setCharacterVelocity(new Vector3(-speed, 0, 0));
			break;
		case 39: // right
			characterEntity.ammoWorkerRigidbodyComponent.setCharacterVelocity(new Vector3(0, 0, -speed));
			break;
		case 40: // down
			characterEntity.ammoWorkerRigidbodyComponent.setCharacterVelocity(new Vector3(speed, 0, 0));
			break;
		}
	}

	document.addEventListener('keydown', keyhandler);
	document.addEventListener('keyup', keyhandler);

	document.addEventListener('keypress', function (event) {
		var ch = String.fromCharCode(event.keyCode);
		switch (ch) {
		case 'a': addPrimitives(); break;
		case 's': ammoWorkerSystem.step(); break;
		case 'v': setVelocity(); break;
		case 'r': addRemove(); break;
		case 'm': setPosition(); break;
		case 'p': playPause(); break;
		case 't': rayCast(); break;
		case 'z': reset(); break;
		case ' ':
			characterEntity.ammoWorkerRigidbodyComponent.characterJump(new Vector3(0, 10, 0));
			break;

		}
	}, false);


	function addOther() {
		var h = new Vector3(10, 5, 0.5);
		createEntity(goo, new Box(20, 10, 1), {mass: 0}, [0, -5, 10],  new AmmoBoxColliderComponent({ halfExtents: h }));
		createEntity(goo, new Box(20, 10, 1), {mass: 0}, [0, -5, -10], new AmmoBoxColliderComponent({ halfExtents: h }));
		h = new Vector3(0.5, 5, 10);
		createEntity(goo, new Box(1, 10, 20), {mass: 0}, [10, -5, 0],  new AmmoBoxColliderComponent({ halfExtents: h }));
		createEntity(goo, new Box(1, 10, 20), {mass: 0}, [-10, -5, 0], new AmmoBoxColliderComponent({ halfExtents: h }));

		//createEntity(goo, new Box(100, 1, 100), { mass: 0, friction: 0 }, [0, -10, 0], new AmmoBoxColliderComponent({ halfExtents: new Vector3(50, 0.5, 50) }));

		// Create compound
		var compoundEntity = goo.world.createEntity(new Vector3(0, 3, 0));
		compoundEntity.addToWorld();
		compoundEntity.setComponent(new AmmoWorkerRigidbodyComponent({
			mass : 1
		}));
		var material = V.getColoredMaterial();
		var h2 = new Vector3(1, 1, 1),
			h3 = new Vector3(1, 1, 1),
			radius = 1;
		var subEntity1 = goo.world.createEntity(new Sphere(10, 10, radius), material, new Vector3(0, 0, 2));
		var subEntity2 = goo.world.createEntity(new Box(h2.x * 2, h2.y * 2, h2.z * 2), material, new Vector3(0, 0, -2));
		var subEntity3 = goo.world.createEntity(new Box(h3.x * 2, h3.y * 2, h3.z * 2), material, new Vector3(0, -2, -2));
		subEntity1.addToWorld();
		subEntity2.addToWorld();
		subEntity3.addToWorld();
		subEntity1.setComponent(new AmmoSphereColliderComponent({ radius: radius }));
		subEntity2.setComponent(new AmmoBoxColliderComponent({ halfExtents: h2 }));
		subEntity3.setComponent(new AmmoBoxColliderComponent({ halfExtents: h3 }));
		compoundEntity.attachChild(subEntity1);
		compoundEntity.attachChild(subEntity2);
		compoundEntity.attachChild(subEntity3);
		subEntity1.transformComponent.transform.rotation.fromAngles(Math.PI / 6, 0, 0);
		subEntity1.transformComponent.setUpdated();

		V.addLights();

		V.addOrbitCamera([50, 0, 0]);
	}

});
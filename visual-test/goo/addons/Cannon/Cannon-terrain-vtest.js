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
	'goo/addons/cannonpack/CannonRigidBodyComponent',
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
	CannonRigidBodyComponent,
	CannonSphereColliderComponent,
	CannonBoxColliderComponent,
	CannonTerrainColliderComponent,
	PointLight,
	LightComponent,
	Surface,
	V
) {
	'use strict';

	/* global CANNON */

	var start = Date.now();
	var nLin = 100,
		nCol = 30,
		elementSize = 0.5;

	var goo = V.initGoo();

	var cannonSystem = new CannonSystem({
		gravity: new Vector3(0, -10, 0),
		maxSubSteps: 3
	});
	goo.world.setSystem(cannonSystem);

	function createSphere(x, y, z) {
		var material = V.getColoredMaterial();
		var radius = 1.5;
		var meshData = new Sphere(8, 8, radius);
		var boxEntity = goo.world.createEntity(meshData, material, [x, y, z]).addToWorld();
		boxEntity.setComponent(new CannonRigidBodyComponent({
			mass: 1
		}));
		boxEntity.setComponent(new CannonSphereColliderComponent({ radius: radius }));
		return boxEntity;
	}

	function createBox(x, y, z) {
		var material = V.getColoredMaterial();
		var halfExtents = new Vector3(5, 0.5, 2);
		var meshData = new Box(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
		var boxEntity = goo.world.createEntity(meshData, material, [x, y, z]).addToWorld();
		boxEntity.setComponent(new CannonRigidBodyComponent({
			mass: 1
		}));
		boxEntity.setComponent(new CannonBoxColliderComponent({ halfExtents: halfExtents }));
		return boxEntity;
	}

	function getMatrix(reverse) {
		var matrix = [];
		var m = Math.cos((Date.now() - start) / 1000 * 0.05);
		var a = m * 0.2;
		var b = m * 0.2;
		//var c = m * 0.4;
		for (var i = 0; i < nLin; i++) {
			var row = [];
			if (reverse) {
				matrix.unshift(row);
			} else {
				matrix.push(row);
			}
			for (var j = 0; j < nCol; j++) {
				var value = Math.sin(i * a) * Math.sin(j * b) + 1;
				//value = i * 0.1;
				//value = (nLin - i -1) * 0.1;
				//value = (nCol - j - 1) * 0.1;
				//value = j * 0.1;
				if (reverse) {
					row.unshift(value);
				} else {
					row.push(value);
				}
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
		entity.setComponent(new CannonRigidBodyComponent({
			mass: 0 // static
		}));

		var meshEntity = goo.world.createEntity(meshData, material, [
			-(nCol - 1) / 2 * elementSize,
			0,
			-(nLin - 1) / 2 * elementSize
		]).addToWorld();
		entity.attachChild(meshEntity);

		// Cannon terrain is facing in Z direction. Move it to center and rotate to compensate.
		colliderEntity = goo.world.createEntity([
			(nCol - 1) / 2 * elementSize,
			0,
			(nLin - 1) / 2 * elementSize,
		]);
		//colliderEntity.setRotation(-Math.PI / 2, -Math.PI / 2, 0);
		colliderEntity.setRotation(-Math.PI / 2, Math.PI / 2, 0);
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
	// 	entity.ammoWorkerRigidBodyComponent.updateCollider(colliderEntity);
	// 	var meshData = Surface.createFromHeightMap(matrix);
	// 	entity.meshDataComponent.meshData = meshData;
	// }


	function addCar(chassisEntity, wheelEntities) {

		// Need to do a process to make the CannonSystem add rigid bodies to the entities
		goo.world.processEntityChanges();

		var world = cannonSystem.world;

        var wheelMaterial = new CANNON.Material("wheelMaterial");
        var wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, world.defaultMaterial, {
            friction: 0.3,
            restitution: 0,
            contactEquationStiffness: 10000
        });

        // We must add the contact materials to the world
        world.addContactMaterial(wheelGroundContactMaterial);

        var centerOfMassAdjust = new CANNON.Vec3(0, 0, 0);
        var chassisBody = chassisEntity.cannonRigidBodyComponent.body;

        // Create the vehicle
        var vehicle = new CANNON.RigidVehicle({
            chassisBody: chassisBody,
            coordinateSystem: new CANNON.Vec3(0, 2, 1) // forward, left, up
        });

        var axisWidth = 7;
        var down = new CANNON.Vec3(0, -1, 0);

        /*
        var wheelBody = wheelEntities[0].cannonRigidBodyComponent.body;
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down
        });

        var wheelBody = wheelEntities[1].cannonRigidBodyComponent.body;
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down
        });

        var wheelBody = wheelEntities[2].cannonRigidBodyComponent.body;
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(-5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down
        });

        var wheelBody = wheelEntities[3].cannonRigidBodyComponent.body;
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(-5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down
        });

        // Some damping to not spin wheels too fast
        for (var i = 0; i < vehicle.wheelBodies.length; i++) {
            vehicle.wheelBodies[i].angularDamping = 0.4;
        }

        vehicle.addToWorld(world);
        vehicle.setMotorSpeed(0.1, 0);
        */
	}

	function init() {
		addTerrain();
		var boxEntity = createBox(0, 3, 0);
		addCar(boxEntity, [
			createSphere(3, 5, -3),
			createSphere(-3, 5, -3),
			createSphere(-3, 5, 3),
			createSphere(3, 5, 3)
		]);
		V.addLights();
		V.addOrbitCamera([50, 0, 0]);
	}

	init();
});

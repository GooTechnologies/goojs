goo.V.attachToGlobal();

	/* global CANNON */

	var start = Date.now();
	var nLin = 100,
		nCol = 30,
		elementSize = 0.5;

	var gooRunner = V.initGoo();

	var cannonSystem = new CannonSystem({
		gravity: new Vector3(0, -10, 0),
		maxSubSteps: 3
	});
	gooRunner.world.setSystem(cannonSystem);

	function createSphere(x, y, z) {
		var material = V.getColoredMaterial();
		var radius = 1.5;
		var meshData = new Sphere(8, 8, radius);
		var boxEntity = gooRunner.world.createEntity(meshData, material, [x, y, z]).addToWorld();
		boxEntity.setComponent(new CannonRigidbodyComponent({
			mass: 1
		}));
		boxEntity.setComponent(new CannonSphereColliderComponent({ radius: radius }));
		return boxEntity;
	}

	function createBox(x, y, z) {
		var material = V.getColoredMaterial();
		var halfExtents = new Vector3(5, 0.5, 2);
		var meshData = new Box(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
		var boxEntity = gooRunner.world.createEntity(meshData, material, [x, y, z]).addToWorld();
		boxEntity.setComponent(new CannonRigidbodyComponent({
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

		entity = gooRunner.world.createEntity([0, -2, 0]).addToWorld();
		entity.setComponent(new CannonRigidbodyComponent({
			mass: 0 // static
		}));

		var meshEntity = gooRunner.world.createEntity(meshData, material, [
			-(nCol - 1) / 2 * elementSize,
			0,
			-(nLin - 1) / 2 * elementSize
		]).addToWorld();
		entity.attachChild(meshEntity);

		// Cannon terrain is facing in Z direction. Move it to center and rotate to compensate.
		colliderEntity = gooRunner.world.createEntity([
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
	// 	entity.ammoWorkerRigidbodyComponent.updateCollider(colliderEntity);
	// 	var meshData = Surface.createFromHeightMap(matrix);
	// 	entity.meshDataComponent.meshData = meshData;
	// }


	function addCar(chassisEntity, wheelEntities) {

		// Need to do a process to make the CannonSystem add rigid bodies to the entities
		gooRunner.world.processEntityChanges();

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
        var chassisBody = chassisEntity.cannonRigidbodyComponent.body;

        // Create the vehicle
        var vehicle = new CANNON.RigidVehicle({
            chassisBody: chassisBody,
            coordinateSystem: new CANNON.Vec3(0, 2, 1) // forward, left, up
        });

        var axisWidth = 7;
        var down = new CANNON.Vec3(0, -1, 0);

        /*
        var wheelBody = wheelEntities[0].cannonRigidbodyComponent.body;
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down
        });

        var wheelBody = wheelEntities[1].cannonRigidbodyComponent.body;
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down
        });

        var wheelBody = wheelEntities[2].cannonRigidbodyComponent.body;
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(-5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down
        });

        var wheelBody = wheelEntities[3].cannonRigidbodyComponent.body;
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

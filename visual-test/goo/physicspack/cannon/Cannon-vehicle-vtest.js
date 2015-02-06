require([
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/math/Vector3',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/ColliderSystem',
	'goo/physicspack/RigidbodyComponent',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'lib/V'
], function (
	Box,
	Quad,
	Vector3,
	ColliderComponent,
	PhysicsSystem,
	ColliderSystem,
	RigidbodyComponent,
	BoxCollider,
	CylinderCollider,
	SphereCollider,
	PlaneCollider,
	V
) {
	'use strict';

	/* global CANNON */

	V.describe('Custom physics engine features can be added via scripts. Control this CANNON.RaycastVehicle via the arrow keys.');

	var goo = V.initGoo();
	var world = goo.world;

	var physicsSystem = new PhysicsSystem();
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());

	function createGround() {
		var entity = world.createEntity(new Quad(1000, 1000, 100, 100), V.getColoredMaterial(0.7, 0.7, 0.7))
			.set([0, -1, 0])
			.setRotation(-Math.PI / 2, 0, 0);
		var rigidBodyComponent = new RigidbodyComponent({ isKinematic: true });
		var planeColliderComponent = new ColliderComponent({ collider: new PlaneCollider() });
		entity.set(rigidBodyComponent)
			.set(planeColliderComponent)
			.addToWorld();
	}

	function createVehicle(x, y, z) {
		var rbComponent = new RigidbodyComponent({
			mass: 150
		});
		var s = 5;

		var script = {
			update: function (args, ctx) {
				var body = ctx.entity.rigidbodyComponent.cannonBody;

				if (body && !ctx.vehicle) {
					var options = {
						radius: 2,
						directionLocal: new CANNON.Vec3(0, -1, 0),
						suspensionStiffness: 30,
						suspensionRestLength: 0.3,
						frictionSlip: 5,
						dampingRelaxation: 2.3,
						dampingCompression: 4.4,
						maxSuspensionForce: 100000,
						rollInfluence:  0.01,
						axleLocal: new CANNON.Vec3(-1, 0, 0),
						chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
						maxSuspensionTravel: 0.3,
						customSlidingRotationalSpeed: -30,
						useCustomSlidingRotationalSpeed: true
					};

					// Create the vehicle
					var vehicle = ctx.vehicle = new CANNON.RaycastVehicle({
						chassisBody: body,
						indexRightAxis: 0, // x
						indexUpAxis: 1, // y
						indexForwardAxis: 2 // z
					});

					var axleWidth = 1;
					var chassisLength = 3;
					options.chassisConnectionPointLocal.set(axleWidth, 0, chassisLength);
					vehicle.addWheel(options);

					options.chassisConnectionPointLocal.set(-axleWidth, 0, chassisLength);
					vehicle.addWheel(options);

					options.chassisConnectionPointLocal.set(axleWidth, 0, -chassisLength);
					vehicle.addWheel(options);

					options.chassisConnectionPointLocal.set(-axleWidth, 0, -chassisLength);
					vehicle.addWheel(options);

					vehicle.addToWorld(physicsSystem.cannonWorld);

					var maxSteerVal = 0.5;
					var maxForce = 500;
					var brakeForce = 100;

					document.onkeydown = document.onkeyup = function keyHandler(event) {
						var up = (event.type === 'keyup');

						if (!up && event.type !== 'keydown') {
							return;
						}

						vehicle.setBrake(0, 0);
						vehicle.setBrake(0, 1);
						vehicle.setBrake(0, 2);
						vehicle.setBrake(0, 3);

						switch (event.keyCode) {

						case 38: // forward
							vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
							vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
							break;

						case 40: // backward
							vehicle.applyEngineForce(up ? 0 : maxForce, 2);
							vehicle.applyEngineForce(up ? 0 : maxForce, 3);
							break;

						case 66: // b
							vehicle.setBrake(brakeForce, 0);
							vehicle.setBrake(brakeForce, 1);
							vehicle.setBrake(brakeForce, 2);
							vehicle.setBrake(brakeForce, 3);
							break;

						case 39: // right
							vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
							vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
							break;

						case 37: // left
							vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
							vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
							break;

						}
					};
				}
			}
		};

		return world.createEntity(new Box(s, 0.5 * s, 2 * s), V.getColoredMaterial(), [x, y, z], script)
			.set(rbComponent)
			.set(new ColliderComponent({ collider: new BoxCollider({ halfExtents: new Vector3(0.5 * s, 0.25 * s, s) }) }))
			.addToWorld();
	}

	createGround();
	createVehicle(0, 2, 0);

	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});

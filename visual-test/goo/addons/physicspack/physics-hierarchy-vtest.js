require([
	'goo/renderer/Material',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/systems/ColliderSystem',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/joints/BallJoint',
	'goo/addons/physicspack/joints/HingeJoint',
	'goo/addons/physicspack/systems/PhysicsDebugRenderSystem',
	'lib/V'
], function (
	Material,
	Sphere,
	Box,
	Cylinder,
	Quad,
	TextureCreator,
	ShaderLib,
	OrbitCamControlScript,
	Vector3,
	ColliderComponent,
	PhysicsSystem,
	ColliderSystem,
	RigidbodyComponent,
	BoxCollider,
	CylinderCollider,
	SphereCollider,
	PlaneCollider,
	BallJoint,
	HingeJoint,
	PhysicsDebugRenderSystem,
	V
) {
	'use strict';

	V.describe('If you build a hierarchy of entities with RigidbodyComponents, funky stuff happens.');

	var goo = V.initGoo();
	var world = goo.world;

	var physicsSystem = new PhysicsSystem();
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());
	world.setSystem(new PhysicsDebugRenderSystem());

	function createBox() {
		var rigidBodyComponent = new RigidbodyComponent();
		var mat = V.getColoredMaterial();
		var entity = world.createEntity(new Box(2, 2, 2), mat, [0.5, 5, 0]);
		var colliderComponent = new ColliderComponent({
			collider: new BoxCollider({
				halfExtents: new Vector3(1, 1, 1)
			})
		});
		entity.set(rigidBodyComponent).set(colliderComponent).addToWorld().setScale(0.9, 0.9, 0.9);
		return entity;
	}

	var rbComponent = new RigidbodyComponent({
		mass: 0,
		angularVelocity: new Vector3(0, 0.5, 0),
		isKinematic: true
	});
	var halfExtents = new Vector3(4, 1, 4);
	world.createEntity(new Box(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2), V.getColoredMaterial(), [0, 0, 0])
		.set(rbComponent)
		.set(
			new ColliderComponent({
				collider: new BoxCollider({
					halfExtents: halfExtents
				})
			})
		).addToWorld()
		.setScale(1,1,1)
		.attachChild(
			createBox().attachChild(
				createBox().attachChild(
					createBox().attachChild(
						createBox().attachChild(
							createBox().attachChild(
								createBox()
							)
						)
					)
				)
			)
		);

	V.addLights();

	V.addOrbitCamera(new Vector3(60, 0, Math.PI / 4));

	V.process();
});

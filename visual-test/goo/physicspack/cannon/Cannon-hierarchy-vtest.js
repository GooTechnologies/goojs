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
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/ColliderSystem',
	'goo/physicspack/RigidbodyComponent',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'goo/physicspack/joints/BallJoint',
	'goo/physicspack/joints/HingeJoint',
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
	V
) {
	'use strict';

	V.describe('If you build a hierarchy of entities with RigidbodyComponents, funky stuff happens.');

	var goo = V.initGoo();
	var world = goo.world;

	var physicsSystem = new PhysicsSystem();
	world.setSystem(physicsSystem);
	world.setSystem(new ColliderSystem());

	var rigidBodyComponent = new RigidbodyComponent();
	var colliderComponent;
	var mat = V.getColoredMaterial();

	var entity = world.createEntity(new Box(2, 2, 2), mat, [1, 5, 0]);
	colliderComponent = new ColliderComponent({
		collider: new BoxCollider({
			halfExtents: new Vector3(1, 1, 1)
		})
	});
	entity.set(rigidBodyComponent).set(colliderComponent).addToWorld().setScale(2, 2, 2);

	var rbComponent = new RigidbodyComponent({
		mass: 0,
		angularVelocity: new Vector3(0, 5, 0),
		isKinematic: true
	});
	var halfExtents = new Vector3(5, 1, 5);
	world.createEntity(new Box(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2), V.getColoredMaterial(), [0, 0, 0])
		.set(rbComponent)
		.set(
			new ColliderComponent({
				collider: new BoxCollider({
					halfExtents: halfExtents
				})
			})
		).addToWorld().attachChild(entity);

	V.addLights();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

	V.process();
});

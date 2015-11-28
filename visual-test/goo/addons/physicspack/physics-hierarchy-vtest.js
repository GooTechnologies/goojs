/* global goo, V */

V.describe('If you build a hierarchy of entities with RigidBodyComponents, funky stuff happens.');

var gooRunner = V.initGoo();
var world = gooRunner.world;

var physicsSystem = new goo.PhysicsSystem();
world.setSystem(physicsSystem);
world.setSystem(new goo.ColliderSystem());
gooRunner.setRenderSystem(new goo.PhysicsDebugRenderSystem());

function createBox() {
	var rigidBodyComponent = new goo.RigidBodyComponent();
	var mat = V.getColoredMaterial();
	var entity = world.createEntity(new goo.Box(2, 2, 2), mat, [0.5, 5, 0]);
	var colliderComponent = new goo.ColliderComponent({
		collider: new goo.BoxCollider({
			halfExtents: new goo.Vector3(1, 1, 1)
		})
	});
	entity.set(rigidBodyComponent).set(colliderComponent).addToWorld().setScale(0.9, 0.9, 0.9);
	rigidBodyComponent.initialize();
	return entity;
}

var rbComponent = new goo.RigidBodyComponent({
	mass: 0,
	angularVelocity: new goo.Vector3(0, 0.5, 0),
	isKinematic: true
});
var halfExtents = new goo.Vector3(4, 1, 4);
world.createEntity(new goo.Box(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2), V.getColoredMaterial(), [0, 0, 0])
	.set(rbComponent)
	.set(
		new goo.ColliderComponent({
			collider: new goo.BoxCollider({
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
rbComponent.initialize();

V.addLights();

V.addOrbitCamera(new goo.Vector3(60, 0, Math.PI / 4));

V.process();

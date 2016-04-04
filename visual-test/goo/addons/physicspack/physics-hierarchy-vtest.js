/* global goo, V */
goo.V.attachToGlobal();
V.describe('If you build a hierarchy of entities with RigidBodyComponents, funky stuff happens.');

var gooRunner = V.initGoo();
var world = gooRunner.world;

var physicsSystem = new PhysicsSystem();
world.setSystem(physicsSystem);
world.setSystem(new ColliderSystem());
gooRunner.setRenderSystem(new PhysicsDebugRenderSystem());

function createBox() {
	var rigidBodyComponent = new RigidBodyComponent();
	var mat = V.getColoredMaterial();
	var entity = world.createEntity(new Box(2, 2, 2), mat, [0.5, 5, 0]);
	var colliderComponent = new ColliderComponent({
		collider: new BoxCollider({
			halfExtents: new Vector3(1, 1, 1)
		})
	});
	entity.set(rigidBodyComponent).set(colliderComponent).addToWorld().setScale(0.9, 0.9, 0.9);
	rigidBodyComponent.initialize();
	return entity;
}

var rbComponent = new RigidBodyComponent({
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
rbComponent.initialize();

V.addLights();

V.addOrbitCamera(new Vector3(60, 0, Math.PI / 4));

V.process();

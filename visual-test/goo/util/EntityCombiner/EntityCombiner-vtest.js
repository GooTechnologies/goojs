
	goo.V.attachToGlobal();

	V.describe('Run EntityCombiner on scene. Combine all except the spinning parent of the cubes. Should show 2 render calls.');

	var gooRunner = V.initGoo();

	var material = new Material(ShaderLib.uber);

	var cylinder1 = new Cylinder(32, 0.6);
	var cylinder2 = new Cylinder(32, 0.6);
	var box1 = new Box(0.3, 1, 1.6);
	var box2 = new Box(1, 1, 0.7);

	var rootEntity = gooRunner.world.createEntity([-2, 0, 0]).addToWorld();
	rootEntity.static = true;

	var parent1 = gooRunner.world.createEntity([-2, 0, 0], function () {
		parent1.setRotation(0, 0, gooRunner.world.time);
	}).addToWorld();
	rootEntity.attachChild(parent1);
	parent1.static = false; // Needs to not be static for spinning

	var child1 = gooRunner.world.createEntity(cylinder1, material, [0, 1, 0]).addToWorld();
	parent1.attachChild(child1);
	child1.static = true;
	var child2 = gooRunner.world.createEntity(cylinder2, material, [0, -1, 0]).addToWorld();
	parent1.attachChild(child2);
	child2.static = true;

	var parent2 = gooRunner.world.createEntity([2, 0, 0]).addToWorld();
	rootEntity.attachChild(parent2);
	parent2.static = true;

	var child1 = gooRunner.world.createEntity(box1, material, [0, 1, 0]).addToWorld();
	parent2.attachChild(child1);
	child1.static = true;
	var child2 = gooRunner.world.createEntity(box2, material, [0, -1, 0]).addToWorld();
	parent2.attachChild(child2);
	child2.static = true;

	new EntityCombiner(gooRunner.world).combine();

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();

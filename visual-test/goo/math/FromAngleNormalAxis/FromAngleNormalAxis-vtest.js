	goo.V.attachToGlobal();

	V.describe('The 2 cones rotate using different methods');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;


	function addCone() {
		var box = world.createEntity(new Box(), V.getColoredMaterial(), [0, 1, 0])
			.addToWorld();

		var cone = world.createEntity(new Cone(), V.getColoredMaterial())
			.setScale(0.5, 0.5, -2)
			.addToWorld();

		return world.createEntity()
			.attachChild(box)
			.attachChild(cone)
			.addToWorld();
	}


	var axis = Vector3.UNIT_Y;

	var cone1 = addCone();
	cone1.set(function (entity) {
		entity.transformComponent.transform.rotation.fromAngleNormalAxis(world.time * 0.5, axis.x, axis.y, axis.z);
		entity.transformComponent.setUpdated();
	}).set([5, 0, 0]);

	var cone2 = addCone();
	var quat = new Quaternion();
	cone2.set(function (entity) {
		quat.fromAngleNormalAxis(world.time * 0.5, axis);
		entity.transformComponent.transform.rotation.copyQuaternion(quat);
		entity.transformComponent.setUpdated();
	}).set([-5, 0, 0]);


	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();

	V.process();

require([
	'goo/shapes/Box',
	'goo/shapes/Cone',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'lib/V'
], function (
	Box,
	Cone,
	Sphere,
	Vector3,
	V
	) {
	'use strict';

	V.describe('The 2 cones look at the sphere using different methods');

	var goo = V.initGoo();
	var world = goo.world;


	function addCone() {
		var box = world.createEntity(new Box(), V.getColoredMaterial(), [0, 1, 0])
			.addToWorld();

		var cone = world.createEntity(new Cone(), V.getColoredMaterial())
			.setScale(0.5, 0.5, -8)
			.addToWorld();

		return world.createEntity()
			.attachChild(box)
			.attachChild(cone)
			.addToWorld();
	}

	function addSphere() {
		var sphere = world.createEntity(new Sphere(32, 32), V.getColoredMaterial())
			.addToWorld();

		sphere.set(function (entity) {
			var time = world.time / 2;
			var x = Math.sin(time) * 4;
			var y = (Math.sin(time * 2) + Math.cos(time * 2)) + 5;
			var z = Math.cos(time) * 4;
			entity.set([x, y, z]);
		});

		return sphere;
	}

	var sphere = addSphere();
	var getSphereTranslation = function () {
		return sphere.transformComponent.worldTransform.translation;
	};


	var cone1 = addCone();
	cone1.set(function (entity) {
		entity.transformComponent.transform.lookAt(getSphereTranslation());
		entity.transformComponent.setUpdated();
	}).set([5, 6, 7]);

	var cone2 = addCone();
	cone2.set(function (entity) {
		var delta = getSphereTranslation().clone().subv(entity.transformComponent.worldTransform.translation);
		entity.transformComponent.transform.rotation.lookAt(delta, Vector3.UNIT_Y);
		entity.transformComponent.setUpdated();
	}).set([-5, 4, 3]);


	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();

	V.process();
});
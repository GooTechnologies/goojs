require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/geometrypack/PolyLine',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cone',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	PolyLine,
	Sphere,
	Box,
	Cone,
	V
	) {
	'use strict';

	V.describe('Extruding a path along another path');

	var goo = V.initGoo();
	var world = goo.world;

	var path = PolyLine.fromCubicSpline([
		-1,  0,  0,

		-1, -1,  0,
		-1, -1,  1,
		 0, -1,  1,

		 1, -1,  1,
		 1, -1,  0,
		 1,  0,  0,

		 1,  1,  0,
		 1,  1,  1,
		 0,  1,  1,

		-1,  1,  1,
		-1,  1,  0,
		-1,  0,  0
	], 14);

	console.log(path);

	//var path = new PolyLine([
	//	-1, -1, -1,
	//	-1, -1,  1,
	//	 1, -1,  1,
	//	 1, -1, -1,
	//
	//	 1,  1, -1,
	//	 1,  1,  1,
	//	-1,  1,  1,
	//	-1,  1, -1
	//]);


	var section = new PolyLine([
		-0.1,  0.0, 0,
		 0.0, -0.1, 0,
		 0.1,  0.0, 0,
		 0.0,  0.1, 0,
		-0.1,  0.0, 0
	]);

	//var section = new PolyLine([
	//	-0.1, 0,  0.0,
	//	 0.0, 0, -0.1,
	//	 0.1, 0,  0.0,
	//	 0.0, 0,  0.1,
	//	-0.1, 0,  0.0,
	//]);

	function addBox(rotation, translation) {
		var box = world.createEntity(new Box(), V.getColoredMaterial()).addToWorld();

		var cone = world.createEntity(new Cone(), V.getColoredMaterial(), [0, 1, 0]).addToWorld();
		cone.setScale(0.2, 0.2, 50);
		box.attachChild(cone);

		box.transformComponent.transform.rotation.copy(rotation);
		box.transformComponent.transform.translation.copy(translation);
		box.setScale(0.3, 0.3, 0.002);
		box.transformComponent.setUpdated();
	}

	var pipeMeshData = path.pipe(section, addBox);

	var material = new Material(ShaderLib.simpleLit);
	world.createEntity(pipeMeshData, material).addToWorld();


	V.addLights();

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

	V.process();
});

require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshDataComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'lib/V'
], function(
	GooRunner,
	Material,
	ShaderLib,
	MeshDataComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	V
) {
	'use strict';

	// initialise goo
	var goo = V.initGoo();
	var world = goo.world;

	// add some lights
	V.addLights();

	// add the camera
	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	// standard materials
	var material = new Material(ShaderLib.simpleLit);

	// add some entities
	world.createEntity(new Box(), material, [3, 0, 0]).addToWorld();
	world.createEntity(new Sphere(32, 32), material, [0, 0, 0]).addToWorld();
	world.createEntity(new Torus(32, 32, 0.1, 0.5), material, [-3, 0, 0]).addToWorld();

	// and a pointer
	var pointer = world.createEntity(new Sphere(32, 32, 0.1), V.getColoredMaterial(1, 0, 0, 0)).addToWorld();

	// register a listener for click events
	goo.addEventListener('click', function (event) {
		if (event.entity) {
			console.log('Picked entity:' + event.entity + ' at ',event.intersection.x, event.intersection.y, event.intersection.z);

			pointer.setTranslation(event.intersection);
		}
	});
});
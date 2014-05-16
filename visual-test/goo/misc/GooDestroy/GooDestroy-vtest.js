require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshDataComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera'
], function (
	GooRunner,
	Material,
	ShaderLib,
	MeshDataComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	PointLight,
	Camera
	) {
	'use strict';

	var goo;

	console.log('Hit 1 to create a goo instance and 2 to destroy it. Use this visual test to check if the garbage collector can collect anything related to goo');

	window.addEventListener('keyup', function (e) {
		if (e.which === 49) {
			if (!goo) { create(); }
		} else if (e.which === 50) {
			if (goo) { destroy(); }
		}
	});

	function create() {
		console.log('create');

		// create goo
		goo = new GooRunner({ logo: 'bottomleft' });
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var world = goo.world;

		// some standard material
		var material = new Material(ShaderLib.simpleLit);

		// some shapes
		world.createEntity(new Box(), material, [1.5, 0, 0]).addToWorld();
		world.createEntity(new Sphere(32, 32), material, [0, 0, 0]).addToWorld();
		world.createEntity(new Torus(32, 32, 0.1, 0.5), material, [-1.5, 0, 0]).addToWorld();

		// 2 lights
		world.createEntity(new PointLight(), [100, 100, 100]).addToWorld();
		world.createEntity(new PointLight(), [-100, -100, -100]).addToWorld();

		// and a camera
		world.createEntity(new Camera(), [0, 0, 10]).addToWorld();
	}

	function destroy() {
		console.log('destroy');

		goo.clear();
		goo = null;
	}
});
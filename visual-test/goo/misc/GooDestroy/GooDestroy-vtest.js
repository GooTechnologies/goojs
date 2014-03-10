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
], function(
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

	window.addEventListener('keyup', function (e) {
		if (e.which === 49) {
			create();
		} else {
			destroy();
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
		// cameras are kept in Renderer.mainCamera and in the system bus which is never cleansed
		//world.createEntity(new Camera(), [0, 0, 10]).lookAt(0, 0, 0).addToWorld();
	}

	function destroy() {
		console.log('destroy');

		// remove all entities from the world
		goo.world.getEntities().forEach(function (entity) { entity.removeFromWorld(); });

		// also stop the game loop and remove references to goo
		setTimeout(function () {
			goo.stopGameLoop();
			var gooCanvas = goo.renderer.domElement;
			gooCanvas.parentNode.removeChild(gooCanvas);
			goo = null;
		}, 300);
	}
});
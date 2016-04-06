
	goo.V.attachToGlobal();

	var gooRunner;

	V.describe([
		'Hit 1 to create a goo instance and 2 to destroy it.',
		' Use this visual test to check if the garbage collector can collect anything related to goo'
	].join('\n'));

	V.button('1', key1);
	V.button('2', key2);

	function key1() {
		if (!gooRunner) { create(); }
	}

	function key2() {
		if (gooRunner) { destroy(); }
	}

	window.addEventListener('keyup', function (e) {
		if (e.which === 49) {
			key1();
		} else if (e.which === 50) {
			key2();
		}
	});

	function create() {
		console.log('create');

		// create goo
		gooRunner = new GooRunner({ logo: 'bottomleft' });
		gooRunner.renderer.domElement.id = 'goo';
		document.body.appendChild(gooRunner.renderer.domElement);

		var world = gooRunner.world;

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

		gooRunner.clear();
		gooRunner = null;
	}

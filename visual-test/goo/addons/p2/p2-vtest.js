require([
	'goo/renderer/Material',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/addons/p2/P2System',
	'goo/addons/p2/P2Component',
	'lib/V'
], function (
	Material,
	Sphere,
	Box,
	Quad,
	TextureCreator,
	ShaderLib,
	Vector3,
	P2System,
	P2Component,
	V
) {
	'use strict';

	var resourcePath = '../../../resources';

	function createEntity(meshData, p2Settings, pos) {
		var material = new Material(ShaderLib.texturedLit);
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png?a=1&b=2#fragment');
		material.setTexture('DIFFUSE_MAP', texture);

		return world.createEntity(meshData, material, pos)
			.set(new P2Component(p2Settings))
			.addToWorld();
	}

	var goo = V.initGoo();
	var world = goo.world;

	var p2System = new P2System();
	world.setSystem(p2System);
	p2System.world.gravity[1] = -20;

	function addPrimitives() {
		for (var i = 0; i < 40; i++) {
			var x = V.rng.nextFloat() * 16 - 8;
			var y = V.rng.nextFloat() * 16 + 8;
			var z = V.rng.nextFloat() * 16 - 8;
			if (V.rng.nextFloat() < 0.5) {
				var w = 1 + V.rng.nextFloat() * 2,
					h = 1 + V.rng.nextFloat() * 2;
				createEntity(new Box(w, h, 1 + V.rng.nextFloat() * 2), {
					mass: 1,
					shapes: [{
						type: 'box',
						width: w,
						height: h
					}]
				}, [x, y, z]);
			} else {
				var radius = 1 + V.rng.nextFloat();
				createEntity(new Sphere(10, 10, radius), {
					mass: 1,
					shapes: [{
						type: 'circle',
						radius: radius
					}]
				}, [x, y, z]);
			}
		}
	}

	addPrimitives();
	document.addEventListener('keypress', addPrimitives, false);

	createEntity(new Quad(1000, 1000, 100, 100), {
		mass: 0,
		offsetAngleX: -Math.PI / 2,
		shapes: [{
			type: 'plane'
		}]
	}, [0, -10, 0]);

	V.addLights();

	V.addOrbitCamera(new Vector3(40, Math.PI / 2, Math.PI / 4));

	V.process();
});

require([
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/addons/ammopack/AmmoSystem',
	'goo/addons/ammopack/AmmoComponent',
	'goo/renderer/light/PointLight',
	'lib/V'
], function (
	Material,
	Camera,
	Box,
	Sphere,
	Quad,
	TextureCreator,
	ShaderLib,
	Vector3,
	AmmoSystem,
	AmmoComponent,
	PointLight,
	V
) {
	'use strict';

	V.describe('All entities in the scene have an ammo component which updates their transform. Press any key to add entities.');

	var resourcePath = '../../../resources';

	function createEntity(meshData, ammoSettings, pos) {
		var material = new Material(ShaderLib.texturedLit, 'BoxMaterial');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.setTexture('DIFFUSE_MAP', texture);
		return world.createEntity(meshData, material, pos)
			.set(new AmmoComponent(ammoSettings))
			.addToWorld();
	}

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new AmmoSystem());

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var x = V.rng.nextFloat() * 16 - 8;
			var y = V.rng.nextFloat() * 16 + 8;
			var z = V.rng.nextFloat() * 16 - 8;
			if (V.rng.nextFloat() < 0.5) {
				createEntity(
					new Box(1 + V.rng.nextFloat() * 2, 1 + V.rng.nextFloat() * 2, 1 + V.rng.nextFloat() * 2),
					{ mass: 1 },
					[x, y, z]
				);
			} else {
				createEntity(
					new Sphere(10, 10, 1 + V.rng.nextFloat()),
					{ mass: 1 },
					[x, y, z]
				);
			}
		}
	}

	V.button('Add Entities', addPrimitives);

	addPrimitives();
	document.addEventListener('keypress', addPrimitives, false);

	createEntity(new Box(5, 5, 5), { mass: 0 }, [0, -7.5, 0]);
	createEntity(new Box(20, 10, 1), { mass: 0 }, [0, -5, 10]);
	createEntity(new Box(20, 10, 1), { mass: 0 }, [0, -5, -10]);
	createEntity(new Box(1, 10, 20), { mass: 0 }, [10, -5, 0]);
	createEntity(new Box(1, 10, 20), { mass: 0 }, [-10, -5, 0]);

	var planeEntity = createEntity(new Quad(1000, 1000, 100, 100), { mass: 0 }, [0, -10, 0]);
	planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);

	world.createEntity(new PointLight(), [0, 100, -10], 'light').addToWorld();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

	V.process();
});

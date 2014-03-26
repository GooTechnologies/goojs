require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/cannon/CannonSystem',
	'goo/addons/cannon/CannonComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'lib/V'
], function (
	GooRunner,
	Material,
	Camera,
	CameraComponent,
	Sphere,
	Box,
	Quad,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	CannonSystem,
	CannonComponent,
	PointLight,
	LightComponent,
	V
) {
	'use strict';

	var resourcePath = '../../../resources';

	function createEntity(meshData, settings) {
		var material = new Material(ShaderLib.texturedLit);
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.setTexture('DIFFUSE_MAP', texture);

		return world.createEntity(meshData, material)
			.set(new CannonComponent(settings))
			.addToWorld();
	}

	var goo = V.initGoo();
	var world = goo.world;

	var cannonSystem = new CannonSystem();
	world.setSystem(cannonSystem);

	function addPrimitives() {
		for (var i = 0; i < 20; i++) {
			var x = V.rng.nextFloat() * 16 - 8;
			var y = V.rng.nextFloat() * 16 + 8;
			var z = V.rng.nextFloat() * 16 - 8;
			if (V.rng.nextFloat() < 0.5) {
				var boxEntity = createEntity(
					new Box(
						1 + V.rng.nextFloat() * 2,
						1 + V.rng.nextFloat() * 2,
						1 + V.rng.nextFloat() * 2
					), { mass: 1 }
				);
				boxEntity.set([x, y, z]);
			} else {
				var sphereEntity = createEntity(new Sphere(10, 10, 1 + V.rng.nextFloat()), {
					mass: 1
				});
				sphereEntity.set([x, y, z]);
			}
		}
	}

	addPrimitives();

	document.addEventListener('keypress', addPrimitives, false);

	createEntity(new Box(5, 5, 5), { mass: 0 }).set([0, -7.5, 0]);
	createEntity(new Box(20, 10, 1), { mass: 0 }).set([0, -5, 10]);
	createEntity(new Box(20, 10, 1), { mass: 0 }).set([0, -5, -10]);
	createEntity(new Box(1, 10, 20), { mass: 0 }).set([10, -5, 0]);
	createEntity(new Box(1, 10, 20), { mass: 0 }).set([-10, -5, 0]);

	createEntity(new Quad(1000, 1000, 100, 100), { mass: 0 })
		.set([0, -10, 0])
		.setRotation(-Math.PI / 2, 0, 0);

	V.addLights();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

	V.process();
});

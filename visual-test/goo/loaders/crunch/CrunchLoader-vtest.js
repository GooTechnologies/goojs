require([
	'goo/renderer/Material',
	'goo/entities/GooRunner',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/Box',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/renderer/shaders/ShaderLib',
	'lib/V'
], function (
	Material,
	GooRunner,
	TextureCreator,
	ScriptComponent,
	Box,
	LightComponent,
	PointLight,
	Camera,
	CameraComponent,
	OrbitCamControlScript,
	Vector3,
	ShaderLib,
	V
) {
	'use strict';

	V.describe('The cubes\' textures are compressed using the crunch algorithm');

	var resourcePath = '../../../resources';

	function createBox(size, x, y, textureUrl, goo) {
		var meshData = new Box(size, size, size, 1, 1);

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(ShaderLib.texturedLit, 'BoxShader');
		new TextureCreator({
			verticalFlip : true
		}).loadTexture2D(resourcePath + textureUrl).then(function (texture) {
			material.setTexture('DIFFUSE_MAP', texture);
		}, function (err) {
			console.error(err);
		});

		goo.world.createEntity(meshData, material, [x, y, 0]).addToWorld();
	}

	// Create typical goo application
	var goo = V.initGoo();
	document.body.appendChild(goo.renderer.domElement);

	V.addOrbitCamera();

	// Setup light
	var light = new PointLight();
	var entity = goo.world.createEntity('Light1');
	entity.setComponent(new LightComponent(light));
	var transformComponent = entity.transformComponent;
	transformComponent.transform.translation.x = 80;
	transformComponent.transform.translation.y = 50;
	transformComponent.transform.translation.z = 80;
	entity.addToWorld();

	createBox(10, -10, 10, '/Pot_Diffuse.dds', goo);
	createBox(10, 10, 10, '/Pot_Diffuse.crn', goo);
	createBox(10, -10, -10, '/collectedBottles_diffuse_1024.dds', goo);
	createBox(10, 10, -10, '/collectedBottles_diffuse_1024.crn', goo);

	V.process();
});

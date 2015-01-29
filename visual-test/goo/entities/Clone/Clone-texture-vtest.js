require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Vector3,
	TextureCreator,
	V
) {
	'use strict';

	V.describe('Cloning textures');

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();


	var textureCreator = new TextureCreator();

	var originalTexture = textureCreator.loadTexture2D('../../../resources/check.png', { repeat: [0.5, 5.5] }, createClones);
	var material1 = new Material(ShaderLib.texturedLit);
	material1.setTexture('DIFFUSE_MAP', originalTexture);

	world.createEntity(new Box(), material1, [0, 0, 0]).addToWorld();

	function createClones() {
		// cloning is delayed until the first texture loads
		// original texture gets updated by the texture creator but the clones can not
		// it's just a matter of cloning at the right moment

		var clonedTexture1 = originalTexture.clone();
		clonedTexture1.offset.setArray(0.5, 0.5);
		var material2 = new Material(ShaderLib.texturedLit);
		material2.setTexture('DIFFUSE_MAP', clonedTexture1);

		var clonedTexture2 = originalTexture.clone();
		var material3 = new Material(ShaderLib.texturedLit);
		material3.setTexture('DIFFUSE_MAP', clonedTexture2);

		world.createEntity(new Box(), material2, [-2, 0, 0]).addToWorld();
		world.createEntity(new Box(), material3, [ 2, 0, 0]).addToWorld();
	}


	V.process();
});
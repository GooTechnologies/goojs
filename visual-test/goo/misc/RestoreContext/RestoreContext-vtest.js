require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Cone',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'lib/V',

	'goo/renderer/Renderer+ContextLost'
], function (
	Material,
	ShaderLib,
	Cone,
	Vector3,
	TextureCreator,
	V
	) {
	'use strict';

	V.describe('Recovering from a context lost');

	var goo = V.initGoo();
	var renderer = goo.renderer;
	var extension = renderer.context.getExtension('WEBGL_lose_context');

	V.button('Lose context!', function () {
		extension.loseContext();
	});

	V.button('Restore context!', function () {
		extension.restoreContext();
	});


	// --- test shape
	var material = new Material(ShaderLib.texturedLit);
	var texture = new TextureCreator().loadTexture2D('../../../resources/cone.png');
	material.setTexture('DIFFUSE_MAP', texture);

	var coneMeshData = new Cone(8, 4, 8);
	var coneEntity = goo.world.createEntity(coneMeshData, material).addToWorld();
	V.showNormals(coneEntity);
	// ---


	V.addLights();
	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	V.process();
});
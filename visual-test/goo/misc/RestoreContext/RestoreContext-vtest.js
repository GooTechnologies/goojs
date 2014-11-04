require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/passpack/ShaderLibExtra',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/TextureCreator',
	'lib/V',

	'goo/renderer/Renderer+ContextLost'
], function (
	Material,
	ShaderLib,
	ShaderLibExtra,
	Box,
	Quad,
	Sphere,
	Vector3,
	PointLight,
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


	V.addColoredSpheres();
	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	V.process();
});
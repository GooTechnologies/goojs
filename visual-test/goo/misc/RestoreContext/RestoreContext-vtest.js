require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/util/ObjectUtils',
	'goo/passpack/PassLib',
	'goo/shapes/Cone',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'lib/V',

	'goo/renderer/Renderer+ContextLost'
], function (
	Material,
	ShaderLib,
	Composer,
	RenderPass,
	FullscreenPass,
	ObjectUtils,
	PassLib,
	Cone,
	Vector3,
	TextureCreator,
	V
	) {
	'use strict';

	V.describe('Recovering from a context lost');

	var goo = V.initGoo();
	var world = goo.world;
	var renderer = goo.renderer;
	var renderSystem = world.getSystem('RenderSystem');
	var extension = renderer.context.getExtension('WEBGL_lose_context');

	V.button('Lose context!', function () {
		extension.loseContext();
	});

	V.button('Restore context!', function () {
		extension.restoreContext();
	});

	// --- test shape
	var material = new Material(ShaderLib.texturedLit);
	new TextureCreator().loadTexture2D('../../../resources/cone.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	var coneMeshData = new Cone(64, 4, 8);
	var coneEntity = world.createEntity(coneMeshData, material).addToWorld();
	V.showNormals(coneEntity);

	var renderPass = new RenderPass(renderSystem.renderList);
	var outPass = new FullscreenPass(ObjectUtils.clone(ShaderLib.copy));
	outPass.renderToScreen = true;

//	var blur = new PassLib.Blur();
	var blur = new PassLib.Sepia();
//	var blur = new PassLib.Bloom();

	var composer = new Composer();
	composer.addPass(renderPass);
	composer.addPass(blur, world.gooRunner.renderer);
	composer.addPass(outPass);

	renderSystem.composers.push(composer);
	// ---


	V.addLights();
	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	V.process();
});
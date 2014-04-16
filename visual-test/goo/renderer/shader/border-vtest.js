require([
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightDebugComponent',
	'lib/V',

	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/pass/BloomPass',

	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib',

], function (
	Vector3,
	Vector4,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightDebugComponent,
	V,
	Composer,
	RenderPass,
	FullscreenPass,
	RenderTarget,
	BloomPass,
	Util,
	ShaderLib
) {

	'use strict';

	var goo = V.initGoo();

	// add some spheres to cast the light on
	V.addSpheres();
	V.addLights();

	// camera
	V.addOrbitCamera();

	// Create composer with same size as screen
	var composer = new Composer();
	var renderPass = new RenderPass(goo.world.getSystem('RenderSystem').renderList);
	renderPass.clearColor = new Vector4(0, 0, 0, 0);

	var vignettePass = new FullscreenPass(Util.clone(ShaderLib.border));
	var filmPass = new FullscreenPass(Util.clone(ShaderLib.film));

	// Regular copy
	var outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
	outPass.renderToScreen = true;

	composer.addPass(renderPass);
	composer.addPass(vignettePass);
	composer.addPass(outPass);
	goo.renderSystem.composers.push(composer);
});
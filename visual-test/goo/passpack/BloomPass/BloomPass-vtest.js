require([
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/shapes/Box',
	'lib/V',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/passpack/BloomPass',
	'goo/renderer/pass/RenderTarget',
	'goo/util/ObjectUtils'
], function (
	Vector3,
	Vector4,
	Box,
	V,
	ShaderLib,
	Composer,
	RenderPass,
	FullscreenPass,
	BloomPass,
	RenderTarget,
	ObjectUtils
) {
	'use strict';

	V.describe('Bloom is used as a posteffect');

	var goo = V.initGoo();
	V.addLights();
	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));
	V.addBoxes();

	var composer = new Composer();

	var bloomPass = new BloomPass();
	bloomPass.copyMaterial.uniforms.opacity = 0.5;
	bloomPass.convolutionMaterial.uniforms.size = 2;
	bloomPass.bcMaterial.uniforms.brightness = -0.2;
	bloomPass.bcMaterial.uniforms.contrast = 0.1;
	bloomPass.enabled = true;

	var renderPass = new RenderPass(goo.world.getSystem('RenderSystem').renderList);
	renderPass.clearColor = new Vector4(0, 0, 0, 0);

	var outPass = new FullscreenPass(ObjectUtils.clone(ShaderLib.copy));
	outPass.renderToScreen = true;

	composer.addPass(renderPass);
	composer.addPass(bloomPass);
	composer.addPass(outPass);

	goo.renderSystem.composers.push(composer);

	V.process();
});
require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/RenderTarget',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/math/Vector3',
	'lib/V'
], function (
	Material,
	ShaderLib,
	RenderTarget,
	Box,
	Quad,
	Vector3,
	V
) {
	'use strict';

	V.describe('The quad is textured with a render target');

	function addQuad(renderTarget) {
		var meshData = new Quad();
		var material = new Material(ShaderLib.textured);
		material.setTexture('DIFFUSE_MAP', renderTarget);
		return gooRunner.world.createEntity(meshData, material, [0, 0, -1]).addToWorld();
	}

	function addBox() {
		var meshData = new Box();
		var material = new Material(ShaderLib.uber);
		return gooRunner.world.createEntity(meshData, material, [0, 0, -3]).addToWorld();
	}

	var gooRunner = V.initGoo();

	var cameraEntity = V.addOrbitCamera(new Vector3(10, 1, 1));

	// something to render on the render target
	var boxEntity = addBox();

	// a target and render on
	var renderTarget = new RenderTarget(512, 512);
	V.delay(2, null, function () {
		gooRunner.renderer.render([boxEntity], cameraEntity.cameraComponent.camera, [], renderTarget, true);
	});

	// the quad to place the target on
	addQuad(renderTarget);

	V.process();
});
require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/renderer/Texture',
	'goo/shapes/Quad',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	'lib/V'
], function(
	Material,
	ShaderLib,
	Camera,
	Texture,
	Quad,
	OrbitCamControlScript,
	ScriptComponent,
	Vector3,
	V
) {
	'use strict';

	V.describe('NPOT textures were at some point believed to cause transparency issues. This is the minimal test scene to prove or disprove the bug.');

	var goo = V.initGoo();
	var world = goo.world;

	createEntity([ 1, 0, 0], [255, 255, 255, 100, 0, 0, 0, 100, 0, 0, 0, 255, 255, 255, 255, 255]);
	createEntity([ 1, 0, 1], [255, 255, 255, 100, 0, 0, 0, 100, 0, 0, 0, 255, 255, 255, 255, 255]);

	createEntity([-1, 0, 0], [
		255, 255, 255, 100,    0,   0,   0, 100,  255, 255, 255, 100,
		  0,   0,   0, 255,  255, 255, 255, 255,    0,   0,   0, 255,
		255, 255, 255, 255,    0,   0,   0, 255,  255, 255, 255, 255]);
	createEntity([-1, 0, 1], [
		255, 255, 255, 100,    0,   0,   0, 100,  255, 255, 255, 100,
		  0,   0,   0, 255,  255, 255, 255, 255,    0,   0,   0, 255,
		255, 255, 255, 255,    0,   0,   0, 255,  255, 255, 255, 255]);

	V.addLights();

	V.addOrbitCamera();

	V.process();

	function getImage(data, width, height) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext('2d');

		var imageData = context.createImageData(width, height);
		imageData.data.set(data);
		context.putImageData(imageData, 0, 0);

		return canvas;
	}

	function createEntity(translation, textureData) {
		var material = new Material(ShaderLib.texturedLit);

		var squareSize = Math.sqrt(textureData.length / 4);

		var colorInfo = new Uint8Array(textureData);
		//var colorInfo = getImage(textureData, squareSize, squareSize);

		var texture = new Texture(colorInfo, null, squareSize, squareSize);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';

		material.setTexture('DIFFUSE_MAP', texture);

		material.blendState.blending = 'CustomBlending';

		material.renderQueue = 2000;

		world.createEntity(new Quad(), material, translation).addToWorld();
	}
});
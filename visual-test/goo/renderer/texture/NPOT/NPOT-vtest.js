
	goo.V.attachToGlobal();

	V.describe('NPOT textures were at some point believed to cause transparency issues. This is the minimal test scene to prove or disprove the bug.');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

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
require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/MeshData',
	'goo/renderer/TextureCreator',
	'goo/addons/linerenderpack/LineRenderSystem',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Quad,
	Sphere,
	Vector3,
	MeshData,
	TextureCreator,
	LineRenderSystem,
	V
	) {
	'use strict';

	var numLines = 30000;

	V.describe('Rendering ' + numLines + ' number of lines in 3 different colors. Red, green and blue');

	var goo = V.initGoo();
	var world = goo.world;
	var LRS = new LineRenderSystem(world);
	
	world.setSystem(LRS);

	V.addOrbitCamera(new Vector3(Math.PI*15, Math.PI / 2, 0.3));
	V.addLights();

	var lineStride = 0.01;
	var lineLength = 10;
	var waveSize = 3;
	var waveSpeed = 3;
	
	var start = new Vector3();
	var end = new Vector3();
	
	var update = function() {
	
		for(var i=0;i<numLines;i++) {
			var iFrac = i / (numLines * 0.1);
			var stride = -lineStride * i;
			var startOffset = Math.sin(world.time * waveSpeed + iFrac * Math.PI) * waveSize;
			var endOffset = Math.sin(world.time * waveSpeed + iFrac * Math.PI) * waveSize;

			start.setDirect(stride + startOffset, -lineLength, stride);
			end.setDirect(stride + endOffset, lineLength, stride);

			var color = LRS.GREEN;

			if (i % 3 === 1) {
				color = LRS.RED;
			}
			else if (i % 3 === 2) {
				color = LRS.BLUE;
			}

			LRS.drawLine(start, end, color);
		}
	};
	
	goo.callbacks.push(update);

	V.process();
});
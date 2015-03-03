require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/math/Matrix4x4',
	'goo/renderer/MeshData',
	'goo/renderer/TextureCreator',
	'goo/addons/linerenderpack/LineRenderSystem',
	'lib/V'
], function (Material,
			 ShaderLib,
			 Box,
			 Quad,
			 Sphere,
			 Vector3,
			 Matrix4x4,
			 MeshData,
			 TextureCreator,
			 LineRenderSystem,
			 V) {
	'use strict';

	V.describe('Render pulsating lines of all the different available colors.' +
	'<br>' +
	'Colors are, from left to right: white, red, green, blue, aqua, magenta, yellow and black.' +
	'<br>' +
	'The pulsating of lines should affect the amount of render calls.');

	var goo = V.initGoo({showStats: true});
	var world = goo.world;
	var lineRenderSystem = new LineRenderSystem(world);

	goo.setRenderSystem(lineRenderSystem);

	V.addOrbitCamera(new Vector3(Math.PI * 2, Math.PI / 2.3, 0.2));

	var lineSpacing = 0.5;
	var coloredLinesStart = new Vector3(-4 * lineSpacing, -0.5, 0);
	//will be set in update
	var coloredLinesEnd = new Vector3();

	var invisibleLineIndex = 0;
	var invisibleTimer = 0;
	var invisibleTime = 0.5;

	var update = function () {

		invisibleTimer += world.tpf;
		while (invisibleTimer >= invisibleTime) {
			invisibleTimer -= invisibleTime;
			invisibleLineIndex = (invisibleLineIndex + 1) % 9;
		}

		//draw 3 colored lines!
		for (var i = 0; i < 8; i++) {

			if (i === invisibleLineIndex) {
				continue;
			}

			var color = lineRenderSystem.WHITE;

			if (i === 1) {
				color = lineRenderSystem.RED;
			}
			else if (i === 2) {
				color = lineRenderSystem.GREEN;
			}
			else if (i === 3) {
				color = lineRenderSystem.BLUE;
			}
			else if (i === 4) {
				color = lineRenderSystem.AQUA;
			}
			else if (i === 5) {
				color = lineRenderSystem.MAGENTA;
			}
			else if (i === 6) {
				color = lineRenderSystem.YELLOW;
			}
			else if (i === 7) {
				color = lineRenderSystem.BLACK;
			}

			coloredLinesStart.setDirect(-3.5 * lineSpacing + i * lineSpacing, -0.5, 0);
			coloredLinesEnd.setVector(coloredLinesStart).addDirect(0, 1, 0);

			lineRenderSystem.drawLine(coloredLinesStart, coloredLinesEnd, color);
		}

	};

	goo.callbacks.push(update);

	V.process();
});
goo.V.attachToGlobal();

	V.describe('Render pulsating lines of all the different available preset colors.' +
	'<br>' +
	'Colors are, from left to right: white, red, green, blue, aqua, magenta, yellow and black.' +
	'<br>' +
	'The pulsating of lines should affect the amount of render calls.');

	var gooRunner = V.initGoo({showStats: true});
	var world = gooRunner.world;
	var lineRenderSystem = new LineRenderSystem(world);

	gooRunner.setRenderSystem(lineRenderSystem);

	V.addOrbitCamera(new Vector3(Math.PI * 2, Math.PI / 2.3, 0.2));

	var lineSpacing = 0.5;
	var coloredLinesStart = new Vector3(-4 * lineSpacing, -0.5, 0);
	//will be set in update
	var coloredLinesEnd = new Vector3();

	var invisibleLineIndex = 0;
	var invisibleTimer = 0;
	var invisibleTime = 0.5;

	var presetColors = [lineRenderSystem.WHITE, lineRenderSystem.RED, lineRenderSystem.GREEN, lineRenderSystem.BLUE, lineRenderSystem.AQUA, lineRenderSystem.MAGENTA, lineRenderSystem.YELLOW, lineRenderSystem.BLACK];

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

			var color = presetColors[i];

			coloredLinesStart.setDirect(-3.5 * lineSpacing + i * lineSpacing, -0.5, 0);
			coloredLinesEnd.set(coloredLinesStart).addDirect(0, 1, 0);

			lineRenderSystem.drawLine(coloredLinesStart, coloredLinesEnd, color);
		}

	};

	gooRunner.callbacks.push(update);

	V.process();
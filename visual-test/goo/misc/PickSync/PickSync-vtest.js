
	goo.V.attachToGlobal();

	V.describe('Synchronous picking: the spheres should change color when clicked on.');

	function swapChannels(colors) {
		var tmp
		tmp = colors[0]; colors[0] = colors[1]; colors[1] = colors[2]; colors[2] = tmp;
	}

	var gooRunner = V.initGoo();
	V.addColoredSpheres();
	V.addLights();
	V.addOrbitCamera();

	function onPick(e) {
		var x, y;
		if (event.touches) {
			x = event.touches[0].clientX;
			y = event.touches[0].clientY;
		} else {
			x = event.offsetX;
			y = event.offsetY;
		}

		var pickResult = gooRunner.pickSync(x, y);

		var entity = gooRunner.world.entityManager.getEntityByIndex(pickResult.id);
		if (entity) {
			var color = entity.meshRendererComponent.materials[0].uniforms.color;
			swapChannels(color);
		}
	}

	window.addEventListener('click', onPick);
	window.addEventListener('touchstart', onPick);

	V.process();

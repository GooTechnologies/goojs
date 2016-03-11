goo.V.attachToGlobal();

	V.describe('All spheres have an html component attached which should have it\'s transform synced');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	V.addLights();
	V.addOrbitCamera();

	// add text system to world
	world.setSystem(new HtmlSystem(gooRunner.renderer));

	// add spheres
	var spheres = V.addColoredSpheres(7);

	// and html elements for every sphere
	spheres.each(function (entity) {
		var htmlElement = document.createElement('p');
		htmlElement.style.position = 'absolute';
		htmlElement.style['-webkit-user-select'] = 'none';
		htmlElement.innerHTML = 'A round box!';
		document.body.appendChild(htmlElement);

		var htmlComponent = new HtmlComponent(htmlElement);

		entity.set(htmlComponent);

		if (Math.random() > 0.5) {
			entity.hide();
		}
	});

	V.process();
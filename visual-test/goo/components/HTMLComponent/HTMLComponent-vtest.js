require([
	'goo/entities/EntityUtils',
	'goo/renderer/Camera',
	'goo/entities/components/HtmlComponent',
	'goo/entities/systems/HtmlSystem',
	'lib/V'
], function (
	EntityUtils,
	Camera,
	HtmlComponent,
	HtmlSystem,
	V
	) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	V.addLights();
	V.addOrbitCamera();

	// add text system to world
	world.setSystem(new HtmlSystem(goo.renderer));

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
			EntityUtils.hide(entity);
		}
	});

	V.process();
});

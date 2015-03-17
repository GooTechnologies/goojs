require([
	'goo/renderer/Camera',
	'goo/entities/components/HtmlComponent',
	'goo/entities/systems/HtmlSystem',
	'lib/V'
], function (
	Camera,
	HtmlComponent,
	HtmlSystem,
	V
	) {
	'use strict';

	V.describe('All spheres have an html component attached which should have it\'s transform synced');

	var goo = V.initGoo({
		alpha: true,
		showStats: false
	});
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
		// htmlElement.style.position = 'absolute';
		// htmlElement.style['-webkit-user-select'] = 'none';
		// htmlElement.style['user-select'] = 'none';
		htmlElement.style.top = '100px';
		htmlElement.style.left = '100px';
		htmlElement.innerHTML = 'A round box!';
		// document.body.appendChild(htmlElement);

		var htmlComponent = new HtmlComponent(htmlElement, {
			useTransformComponent: false
		});
		entity.set(htmlComponent);

		if (Math.random() > 0.5) {
			entity.hide();
		}
	});

	V.process();
});

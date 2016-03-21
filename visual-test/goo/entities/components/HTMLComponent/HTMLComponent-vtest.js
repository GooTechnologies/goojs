require([
	'goo/renderer/Camera',
	'goo/math/MathUtils',
	'goo/math/Vector3',
	'goo/entities/components/HtmlComponent',
	'goo/entities/systems/HtmlSystem',
	'lib/V'
], function (
	Camera,
	MathUtils,
	Vector3,
	HtmlComponent,
	HtmlSystem,
	V
	) {
	'use strict';

	V.describe('All spheres have an html component attached which should have it\'s transform synced');

	var goo = V.initGoo();
	var world = goo.world;

	V.addLights();
	V.addOrbitCamera(new Vector3(30, Math.PI / 2, Math.PI / 4));

	// add text system to world
	world.setSystem(new HtmlSystem(goo.renderer));

	// add spheres
	var spheres = V.addColoredSpheres(20);

	// and html elements for every sphere
	spheres.each(function (entity) {
		var htmlElement = document.createElement('p');
		htmlElement.style.position = 'absolute';
		htmlElement.style['-webkit-user-select'] = 'none';
		htmlElement.innerHTML = 'A round box!';
		document.body.appendChild(htmlElement);

		var htmlComponent = new HtmlComponent(htmlElement, {
			useTransformComponent: MathUtils.fastRandom() > 0.1,
			pixelPerfect: MathUtils.fastRandom() > 0.5
		});

		entity.set(htmlComponent);

		if (MathUtils.fastRandom() > 0.8) {
			entity.hide();
		}
	});

	V.process();
});

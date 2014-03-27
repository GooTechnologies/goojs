require([
	'goo/renderer/Camera',
	'goo/entities/components/HTMLComponent',
	'goo/entities/systems/HTMLSystem',
	'lib/V'
], function (
	Camera,
	HTMLComponent,
	HTMLSystem,
	V
	) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	V.addLights();
	V.addOrbitCamera();

	// add text system to world
	world.setSystem(new HTMLSystem(goo.renderer));

	// add spheres
	var spheres = V.addColoredSpheres(7);

	// and html elements for every sphere
	spheres.each(function (entity) {
		var htmlElement = document.createElement('p');
		htmlElement.style.position = 'absolute'
		htmlElement.style['-webkit-user-select'] = 'none';
		htmlElement.innerHTML = 'A round box!';
		document.body.appendChild(htmlElement);

		var htmlComponent = new HTMLComponent(htmlElement);

		entity.set(htmlComponent);
	});

	V.process();
});

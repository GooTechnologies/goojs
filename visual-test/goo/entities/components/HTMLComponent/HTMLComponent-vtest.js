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
		var htmlElement = document.createElement('div');
		htmlElement.style['-webkit-user-select'] = 'none';
		htmlElement.style['user-select'] = 'none';
		htmlElement.style['background-color'] = 'white';
		htmlElement.innerHTML = 'A box!';

		var htmlComponent = new HtmlComponent(htmlElement, {
			useTransformComponent: V.rng.nextFloat() > 0.5
		});
		var htmlEntity = world.createEntity('html', htmlComponent).addToWorld();
		htmlEntity.setScale(0.01, 0.01, 1);
		entity.attachChild(htmlEntity);

		if (V.rng.nextFloat() > 0.5) {
			entity.hide();
		}
	});

	V.process();
});

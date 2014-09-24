require([
	'lib/V'
], function (
	V
	) {
	'use strict';

	V.describe('Tap test: the spheres should change color when tapped on.');

	function swapChannels(colors) {
		var tmp = colors[0];
		colors[0] = colors[1];
		colors[1] = colors[2];
		colors[2] = tmp;
	}

	var goo = V.initGoo();
	V.addColoredSpheres();
	V.addLights();
	V.addOrbitCamera();

	goo.addEventListener('tap', function (event) {
		var entity = event.entity;
		if (entity) {
			var color = entity.meshRendererComponent.materials[0].uniforms.color;
			swapChannels(color);
		}
	});

	V.process();
});

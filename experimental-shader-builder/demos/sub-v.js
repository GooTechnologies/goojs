(function () {
	'use strict';

	var GooRunner = goo.GooRunner;
	var MathUtils = goo.MathUtils;
	var Scripts = goo.Scripts;
	var Vector3 = goo.Vector3;
	var Camera = goo.Camera;
	var OrbitCamControlScript = goo.OrbitCamControlScript;

	var gooRunner;

	function initGoo(options) {
		gooRunner = new GooRunner(options);

		var canvasContainer = document.getElementById('canvas-container');
		if (canvasContainer) {
			canvasContainer.appendChild(gooRunner.renderer.domElement);
		} else {
			document.body.appendChild(gooRunner.renderer.domElement);
		}

		gooRunner.renderer.setClearColor(103 / 255, 115 / 255, 129 / 255, 1.0); // dark blue-grey

		return gooRunner;
	}

	function addOrbitCamera(spherical, lookAt, dragButton) {
		spherical = spherical ? new Vector3(spherical) : new Vector3(20, 0, 0);
		lookAt = lookAt ? new Vector3(lookAt) : new Vector3(0, 0, 0);

		// Convert to degrees since the script uses degrees
		spherical.y = MathUtils.degFromRad(spherical.y);
		spherical.z = MathUtils.degFromRad(spherical.z);

		var camera = new Camera();

		var orbitCamOptions = {
			domElement        : gooRunner.renderer.domElement,
			lookAtDistance    : null,
			spherical         : spherical,
			lookAtPoint       : lookAt,
			releaseVelocity   : true,
			interpolationSpeed: 7,
			dragButton        : dragButton || 'Any'
		};

		var orbitScript = Scripts.create(OrbitCamControlScript, orbitCamOptions);
		return gooRunner.world.createEntity(camera, orbitScript, 'CameraEntity').addToWorld();
	}

	window.v = window.v || {};
	window.v.initGoo = initGoo;
	window.v.addOrbitCamera = addOrbitCamera;
})();
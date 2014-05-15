require([
	'goo/renderer/Camera',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	'goo/debugpack/FrustumViewer',
	'lib/V'
], function (
	Camera,
	OrbitCamControlScript,
	ScriptComponent,
	Vector3,
	FrustumViewer,
	V
) {
	'use strict';

	var cameraState = {
		spin: true,
		angle: 0,
		mainCameraId: 1
	};

	var goo = V.initGoo();
	var world = goo.world;

	V.addColoredSpheres();

	var camera1Entity, camera2Entity;

	console.log('Keys 1, 2 switch main camera; key 3 starts/stops the spinning of camera 1');

	document.body.addEventListener('keypress', function (e) {
		switch (e.keyCode) {
		case 49:
			if (cameraState.mainCameraId === 1) {
				camera1Entity.setAsMainCamera();
				cameraState.mainCameraId = 0;
			}
			break;
		case 50:
			if (cameraState.mainCameraId === 0) {
				camera2Entity.setAsMainCamera();
				cameraState.mainCameraId = 1;
			}
			break;
		case 51:
			cameraState.spin = !cameraState.spin;
			break;
		}
	});

	// camera 1 - spinning
	camera1Entity = world.createEntity(new Camera(), 'CameraEntity', [0, 0, 3]).lookAt(0, 0, 0).addToWorld();

	camera1Entity.set(function (entity) {
			if (cameraState.spin) {
				cameraState.angle += 0.01;
				entity.setRotation(cameraState.angle, 0, 0);
			}
		});

	// camera 2 - main, with orbit cam control script
	camera2Entity = V.addOrbitCamera();

	// attach frustums
	FrustumViewer.attachGuide(camera1Entity);
	FrustumViewer.attachGuide(camera2Entity);

	V.process();
});

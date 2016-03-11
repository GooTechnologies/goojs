
	'use strict';

	V.describe([
		'Click on any object and a small red sphere should appear at the intersection between the pick ray originating from the camera and the clicked-on object',
        'Change the projection mode by hitting P'
	].join('\n'));

    V.button('P', keyP);

	// initialise goo
	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	// add some lights
	V.addLights();

	// add the camera
	var cameraEntity = V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));
	var camera = cameraEntity.cameraComponent.camera;

	// standard materials
	var material = new Material(ShaderLib.simpleLit);

	// add some entities
	world.createEntity(new Box(), material, [3, 0, 0]).addToWorld();
	world.createEntity(new Sphere(32, 32), material, [0, 0, 0]).addToWorld();
	world.createEntity(new Torus(32, 32, 0.1, 0.5), material, [-3, 0, 0]).addToWorld();

	// and a pointer
	var pointer = world.createEntity(new Sphere(32, 32, 0.1), V.getColoredMaterial(1, 0, 0, 0)).addToWorld();

    var onPick = function (event) {
        if (event.entity) {
            pointer.setTranslation(Math.random() * 3, Math.random() * 3, 0);

            console.log(
                'Picked entity:', event.entity,
                'at', event.intersection.x, event.intersection.y, event.intersection.z,
                'at depth:', event.depth
            );

            pointer.setTranslation(event.intersection);
        }
    };

	// register a listener for click events
	gooRunner.addEventListener('click', onPick);
    gooRunner.addEventListener('touchstart', onPick);

	var size = 3;
	var fov = camera.fov;
	var aspect = camera.aspect;
	var near = camera.near;
	var far = camera.far;

    function keyP() {
        if (camera.projectionMode === Camera.Parallel){
            camera.setProjectionMode(Camera.Perspective);
            camera.setFrustumPerspective(fov, aspect, near, far);
        } else {
            camera.setProjectionMode(Camera.Parallel);
            camera.setFrustum(near, far, -size, size, size, -size, aspect);
        }
    }

	// register a listener for click events
	document.addEventListener('keypress', function (event) {
		switch (event.keyCode) {
			case 112: keyP(); break;
		}
	});

	V.process();
});
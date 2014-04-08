require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/shapes/Quad',
	'lib/V',
	'goo/renderer/Camera'
], function(
	GooRunner,
	Material,
	ShaderLib,
	MeshDataComponent,
	MeshRendererComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	Quad,
	V,
	Camera
) {
	'use strict';

	// initialise goo
	var goo = V.initGoo();
	var world = goo.world;

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

	// register a listener for click events
	goo.addEventListener('click', function (event) {
		if (event.entity) {
			console.log('Picked entity:' + event.entity + ' at ',event.intersection.x, event.intersection.y, event.intersection.z + ' at depth = ' + event.depth);

			pointer.setTranslation(event.intersection);
		}
	});

	var size = 3;
	var fov = camera.fov;
	var aspect = camera.aspect;
	var near = camera.near;
	var far = camera.far;

	// register a listener for click events
	document.addEventListener('keypress', function (event) {
		switch(event.keyCode){
			case 112: // p
				if(camera.projectionMode === Camera.Parallel){
					camera.setProjectionMode(Camera.Perspective);
					camera.setFrustumPerspective(fov, aspect, near, far);
				} else {
					camera.setProjectionMode(Camera.Parallel);
					camera.setFrustum(near, far, -size, size, size, -size, aspect);
				}
				break;
		}
	});

	V.addDebugQuad();

});
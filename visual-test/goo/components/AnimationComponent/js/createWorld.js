define([
	'goo/entities/GooRunner',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/renderer/light/DirectionalLight',
	'goo/entities/components/LightComponent',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/util/Grid'
], function(
	GooRunner,
	Vector3,
	Camera,
	CameraComponent,
	DirectionalLight,
	LightComponent,
	ScriptComponent,
	OrbitCamControlScript,
	Grid
) {
	'use strict';

	return function() {
		var goo = new GooRunner({
			showStats: true,
			antialias : true,
			manuallyStartGameLoop : true
		});
		goo.renderer.domElement.id = 'goo';
		goo.renderer.setClearColor(0.5, 0.5, 0.5, 1);
		document.body.appendChild(goo.renderer.domElement);

		// Camera
		var camera = new Camera(45, 1, 1, 10000);
		var cameraEntity = goo.world.createEntity('CameraEntity');
		cameraEntity.setComponent(new CameraComponent(camera));

		// Camera control
		var orbitCamScript = new OrbitCamControlScript({
			domElement: goo.renderer.domElement,
			spherical: new Vector3(400, Math.PI/6, Math.PI/6),
			// zoomSpeed: 0.01,
			zoomSpeed: 10.0,
			minZoomDistance: 3,
			maxZoomDistance: 1000,
			baseDistance: 5,
			lookAtPoint: new Vector3(0, 120, 0)
		});
		var scripts = new ScriptComponent();
		scripts.scripts.push(orbitCamScript);
		cameraEntity.setComponent(scripts);

		cameraEntity.addToWorld();

		// Let there be light
		var lightEntity, dirLight;

		lightEntity = goo.world.createEntity('Light1');
		dirLight = new DirectionalLight();
		dirLight.color.setd(1.0, 1.0, 0.95);
		lightEntity.setComponent(new LightComponent(dirLight));
		lightEntity.transformComponent.transform.translation.setd(20, 5, 10);
		lightEntity.transformComponent.transform.lookAt(new Vector3(0,0,0), Vector3.UNIT_Y);
		lightEntity.addToWorld();

		// Let there be a second light
		lightEntity = goo.world.createEntity('Light2');
		dirLight = new DirectionalLight();
		dirLight.color.setd(0.8, 0.8, 0.76);
		dirLight.specularIntensity = 0;
		lightEntity.setComponent(new LightComponent(dirLight));
		lightEntity.transformComponent.transform.translation.setd(-20, 5, 10);
		lightEntity.transformComponent.transform.lookAt(new Vector3(0,0,0), Vector3.UNIT_Y);
		lightEntity.addToWorld();

		// Let there be a third light
		lightEntity = goo.world.createEntity('Light3');
		dirLight = new DirectionalLight();
		dirLight.color.setd(0.7, 0.7, 0.6);
		dirLight.specularIntensity = 0;
		lightEntity.setComponent(new LightComponent(dirLight));
		lightEntity.transformComponent.transform.translation.setd(0, 5, -12);
		lightEntity.transformComponent.transform.lookAt(new Vector3(0,0,0), Vector3.UNIT_Y);
		lightEntity.addToWorld();

		var grid = new Grid(goo.world, {
			floor: true,
			width: 400,
			height: 400,
			surface: true,
			surfaceColor: [0.9, 0.9, 0.9, 1],
			grids: [{
				stepX: 50,
				stepY: 50,
				color: [0.7, 0.7, 0.7, 1]
			}]
		});
		grid.addToWorld();


		return goo;
	};
});
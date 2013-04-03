define([
	'goo/entities/GooRunner',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript'
], function(
	GooRunner,
	Vector3,
	Camera,
	CameraComponent,
	PointLight,
	LightComponent,
	ScriptComponent,
	OrbitCamControlScript

) {
	"use strict";

	function DemoWorld() {}


	DemoWorld.create = function(distance) {
		var goo = new GooRunner({
			showStats: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// Camera
		var camera = new Camera(45, 1, 1, 10000);
		var cameraEntity = goo.world.createEntity('CameraEntity');
		//cameraEntity.transformComponent.transform.translation.set(500, 0, 0);
		//cameraEntity.transformComponent.transform.lookAt(
		//	new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.addToWorld();
		cameraEntity.setComponent(new CameraComponent(camera));

		// Camera control
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			baseDistance : distance/4,
			spherical : new Vector3(distance, 0 , 0)
		}));
		cameraEntity.setComponent(scripts);

		// Light
		var light = new PointLight();
		var entity = goo.world.createEntity('Light');
		entity.setComponent(new LightComponent(light));
		entity.transformComponent.transform.translation.set(80, 50, 80);
		entity.addToWorld();

		return goo;
	};

	return DemoWorld;

});

define([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/addons/howler/components/HowlerComponent',
	'goo/addons/howler/systems/HowlerSystem',
	'goo/renderer/TextureCreator'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	EntityUtils,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent,
	HowlerComponent,
	HowlerSystem,
	TextureCreator
	) {
	'use strict';

	var V = {
		addOrbitCamera: function(goo, spherical) {
			var spherical = spherical || new Vector3(20, Math.PI / 2, 0);

			var camera = new Camera(45, 1, 1, 1000);
			var cameraEntity = goo.world.createEntity("CameraEntity");
			cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
			cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
			cameraEntity.setComponent(new CameraComponent(camera));
			cameraEntity.addToWorld();
			var scripts = new ScriptComponent();
			scripts.scripts.push(new OrbitCamControlScript({
				domElement : goo.renderer.domElement,
				spherical : spherical,
				demoMode: true,
				moveInterval: 4000,
				moveInitialDelay: 2000
			}));
			cameraEntity.setComponent(scripts);

			return cameraEntity;
		},

		addColoredBalls: function(goo) {

		},

		addLight: function(goo) {

		}
	};

	return V;
});

require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
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
	'goo/shapes/PolyLine'
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
	PolyLine
	) {
	'use strict';

	function surfaceDemo(goo) {
		var xGenerator = PolyLine.fromCubicSpline([
			0, 0, 0,
			1, 0, 0,
			1, 1, 0,
			0, 1, 0,
			-1, 1, 0,
			-1, 2, 0,
			0, 2, 0], 20);

		var yGenerator = PolyLine.fromCubicSpline([
			0, 0, 0,
			1, 0, 0,
			1, 0, 1,
			0, 0, 1,
			-1, 0, 1,
			-1, 0, 2,
			0, 0, 2], 20);

		var surfaceMeshData = xGenerator.mul(yGenerator);

		var material = Material.createMaterial(ShaderLib.simpleLit, '');
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, surfaceMeshData, material, '');
		boxEntity.transformComponent.transform.setRotationXYZ(0, Math.PI/4 + Math.PI/2, -Math.PI/16);
		boxEntity.addToWorld();

		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(-1, -3, -5);
		lightEntity.addToWorld();

		// camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(10, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		surfaceDemo(goo);
	}

	init();
});

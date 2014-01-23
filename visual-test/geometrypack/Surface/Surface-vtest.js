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
	'geometrypack/PolyLine'
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
	PolyLine,
	V
	) {
	'use strict';

	function surfaceDemo(goo) {
		var xGenerator = PolyLine.fromCubicSpline([
			0, 0, 0,
			1, 0, 0,
			1, 0.5, 0,
			0, 1, 0,
			-1, 1.5, 0,
			-1, 2, 0,
			0, 2, 0], 20);
		/*
		var xGenerator = PolyLine.fromCubicSpline([
			0, 0, 0,
			1, 0, 0,
			1, 0.5, 0,
			0, 1, 0], 20);
        */
		var yGenerator = PolyLine.fromCubicSpline([
			0, 0, 0,
			1, 0, 0,
			1, 0, 0.5,
			0, 0, 1,
			-1, 0, 1.5,
			-1, 0, 2,
			0, 0, 2], 20);

		// generator material
		var generatorMaterial = Material.createMaterial(ShaderLib.simpleColored, '');

		// x generator
		var xGeneratorEntity = EntityUtils.createTypicalEntity(goo.world, xGenerator, generatorMaterial, '');
		xGeneratorEntity.transformComponent.transform.translation.setd(-1, 0, 0);
		xGeneratorEntity.addToWorld();

		// y generator
		var yGeneratorEntity = EntityUtils.createTypicalEntity(goo.world, yGenerator, generatorMaterial, '');
		yGeneratorEntity.transformComponent.transform.translation.setd(-1, 0, 0);
		yGeneratorEntity.addToWorld();

		// surface mesh data
		var surfaceMeshData = xGenerator.mul(yGenerator);

		// surface material
		var surfaceMaterial = Material.createMaterial(ShaderLib.simpleLit, '');

		// surface entity
		var surfaceEntity = EntityUtils.createTypicalEntity(goo.world, surfaceMeshData, surfaceMaterial, '');
		surfaceEntity.addToWorld();

		var normalsMeshData = surfaceMeshData.getNormalsMeshData(6);
		var normalsMaterial = Material.createMaterial(ShaderLib.simpleColored, '');
		normalsMaterial.uniforms.color = [0.2, 1.0, 0.6];
		var normalsEntity = EntityUtils.createTypicalEntity(goo.world, normalsMeshData, normalsMaterial, '');
		normalsEntity.addToWorld();

		var light1 = new PointLight();
		//light1.color = [1.0, 0.3, 0.0];
		var light1Entity = goo.world.createEntity('light');
		light1Entity.setComponent(new LightComponent(light1));
		light1Entity.transformComponent.transform.translation.set(10, 10, 10);
		light1Entity.addToWorld();

		var light2 = new PointLight();
		//light2.color = [1.0, 0.3, 0.0];
		var light2Entity = goo.world.createEntity('light');
		light2Entity.setComponent(new LightComponent(light2));
		light2Entity.transformComponent.transform.translation.set(-10, -10,  -10);
		light2Entity.addToWorld();

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
			spherical : new Vector3(300, Math.PI / 2, 0)
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

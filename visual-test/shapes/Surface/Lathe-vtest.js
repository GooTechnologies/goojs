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
	'goo/shapes/PolyLine',
	'../../lib/V'
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

	function latheDemo(goo) {
		var section = PolyLine.fromCubicSpline([
			3 + 0, -1, 0,
			3 + 1, 0, 0,
			3 + 1, 1, 0,
			3 + 0, 1, 0,
			3 + -1, 1, 0,
			3 + -1, 2, 0,
			3 + 0, 3, 0], 20);

		var latheMeshData = section.lathe(20);

		var material = Material.createMaterial(ShaderLib.simpleLit, '');
		var latheEntity = EntityUtils.createTypicalEntity(goo.world, latheMeshData, material, '');
		latheEntity.addToWorld();

		var normalsMeshData = latheMeshData.getNormalsMeshData(4);
		var normalsMaterial = Material.createMaterial(ShaderLib.simpleColored, '');
		normalsMaterial.uniforms.color = [0.2, 1.0, 0.6];
		var normalsEntity = EntityUtils.createTypicalEntity(goo.world, normalsMeshData, normalsMaterial, '');
		normalsEntity.addToWorld();

		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(0, 2, 10);
		lightEntity.addToWorld();

		// camera
		V.addOrbitCamera(goo, new Vector3(10, Math.PI / 2, 0));
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		latheDemo(goo);
	}

	init();
});

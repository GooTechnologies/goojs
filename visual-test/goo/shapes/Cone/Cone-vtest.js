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
	'goo/renderer/TextureCreator',
	'goo/shapes/Cone',
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
	TextureCreator,
	Cone,
	V
	) {
	'use strict';

	function addNormalsToWorld(goo, entity) {
		var normalsMeshData = entity.meshDataComponent.meshData.getNormalsMeshData();
		var normalsMaterial = Material.createMaterial(ShaderLib.simpleColored, '');
		normalsMaterial.uniforms.color = [0.2, 1.0, 0.6];
		var normalsEntity = EntityUtils.createTypicalEntity(goo.world, normalsMeshData, normalsMaterial, '');
		normalsEntity.transformComponent.transform = entity.transformComponent.transform;
		normalsEntity.addToWorld();
	}

	function coneDemo(goo) {
		var material = Material.createMaterial(ShaderLib.texturedLit, '');
		var texture = new TextureCreator().loadTexture2D('../../resources/cone.png');
		material.setTexture('DIFFUSE_MAP', texture);

		// add normal cone
		var normalConeMeshData = new Cone(8, 4, 8);
		var normalConeEntity = EntityUtils.createTypicalEntity(goo.world, normalConeMeshData, material, 'Pointy Cone');
		normalConeEntity.transformComponent.transform.translation.setd(-4.5, 0, 0);
		normalConeEntity.addToWorld();
		addNormalsToWorld(goo, normalConeEntity);

		// add flat cone
		var flatConeMeshData = new Cone(64, 4, 0);
		var flatConeEntity = EntityUtils.createTypicalEntity(goo.world, flatConeMeshData, material, 'Flat Cone');
		flatConeEntity.transformComponent.transform.translation.setd( 4.5, 0, 0);
		flatConeEntity.addToWorld();
		addNormalsToWorld(goo, flatConeEntity);

		// add lights
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(0, 10, 10);
		lightEntity.addToWorld();

		// camera
		V.addOrbitCamera(goo, new Vector3(25, Math.PI / 2, 0));
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		coneDemo(goo);
	}

	init();
});

require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
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
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
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

	function coneDemo() {
		var goo = V.initGoo();

		var material = new Material(ShaderLib.texturedLit, '');
		var texture = new TextureCreator().loadTexture2D('../../resources/cone.png');
		material.setTexture('DIFFUSE_MAP', texture);

		// add normal cone
		var normalConeMeshData = new Cone(8, 4, 8);
		var normalConeEntity = goo.world.createEntity(normalConeMeshData, material, 'Pointy Cone', [-4.5, 0, 0]).addToWorld();
		V.showNormals(normalConeEntity);

		// add flat cone
		var flatConeMeshData = new Cone(64, 4, 0);
		var flatConeEntity = goo.world.createEntity(flatConeMeshData, material, 'Flat Cone');
		flatConeEntity.transformComponent.transform.translation.setd( 4.5, 0, 0);
		flatConeEntity.addToWorld();
		V.showNormals(flatConeEntity);

		// add lights
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(0, 10, 10);
		lightEntity.addToWorld();

		V.addLights();

		V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));
	}

	coneDemo();
});

require([
	'goo/entities/GooRunner',
	'goo/entities/World',
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
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/TextureCreator',
	'goo/entities/components/LightComponent',
	'../../lib/V'
], function(
	GooRunner,
	World,
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
	DirectionalLight,
	TextureCreator,
	LightComponent,
	V
) {
	'use strict';

	var resourcePath = '../../resources/';

	var goo = V.initGoo();
	var world = goo.world;

	var boxEntity = createBoxEntity();
	boxEntity.transformComponent.setTranslation(-50, -0.5, 0);
	boxEntity.addToWorld();

	boxEntity = createBoxEntity(goo.renderer.capabilities.maxAnisotropy);
	boxEntity.transformComponent.setTranslation(50, -0.5, 0);
	boxEntity.addToWorld();

	V.addLights();

	var camera = new Camera(45, 1, 0.1, 1000);
	var cameraEntity = goo.world.createEntity("CameraEntity");
	cameraEntity.setComponent(new CameraComponent(camera));
	cameraEntity.addToWorld();
	var scripts = new ScriptComponent();
	scripts.scripts.push(new OrbitCamControlScript({
		domElement: goo.renderer.domElement,
		spherical: new Vector3(1, Math.PI / 2, 0.1),
		minAscent: 0.1,
		turnSpeedHorizontal: 0.001,
		turnSpeedVertical: 0.001
	}));
	cameraEntity.setComponent(scripts);


	function createBoxEntity(anisotropy) {
		var meshData = ShapeCreator.createBox(100, 1, 100, 200, 200);
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		var entity = world.createEntity(meshData, material);

		var texture = new TextureCreator().loadTexture2D(resourcePath + 'font.png', { anisotropy: anisotropy });
		material.setTexture('DIFFUSE_MAP', texture);

		return entity;
	}
});
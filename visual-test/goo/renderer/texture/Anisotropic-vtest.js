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
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/TextureCreator',
	'goo/entities/components/LightComponent'
], function(
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
	DirectionalLight,
	TextureCreator,
	LightComponent
) {
	'use strict';

	var resourcePath = "../../resources";

	function anisotropicDemo(goo) {
		var boxEntity = createBoxEntity(goo);
		boxEntity.transformComponent.setTranslation(-50, -0.5, 0);
		boxEntity.addToWorld();

		boxEntity = createBoxEntity(goo, goo.renderer.capabilities.maxAnisotropy);
		boxEntity.transformComponent.setTranslation(50, -0.5, 0);
		boxEntity.addToWorld();

		var light = new DirectionalLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(1, 10, 1);
		lightEntity.transformComponent.transform.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
		lightEntity.addToWorld();

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
	}

	function createBoxEntity(goo, anisotropy) {
		var meshData = ShapeCreator.createBox(100, 1, 100, 200, 200);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		TextureCreator.clearCache();
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/font.png');
		texture.anisotropy = anisotropy;
		material.setTexture('DIFFUSE_MAP', texture);
		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	function init() {
		var goo = new GooRunner({
			showStats: true,
			toolMode: true,
			logo: 'bottomleft'
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		anisotropicDemo(goo);
	}

	init();
});
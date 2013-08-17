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
	'goo/shapes/Surface',
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
	Surface,
	TextureCreator
	) {
	'use strict';

	function addHalo(goo, x, y, z) {
		var quadMeshData = ShapeCreator.createQuad(3, 3);
		var quadMaterial = Material.createMaterial(ShaderLib.billboard, 'mat');
		var quadTexture = new TextureCreator().loadTexture2D('../../resources/flare.png');
		quadMaterial.setTexture('DIFFUSE_MAP', quadTexture);
		quadMaterial.blendState.blending = 'AlphaBlending';
		quadMaterial.renderQueue = 2001;

		var quadEntity = EntityUtils.createTypicalEntity(goo.world, quadMeshData, quadMaterial);
		quadEntity.transformComponent.transform.translation.setd(x, y, z);
		quadEntity.addToWorld();
	}

	function addBox(goo) {
		var boxMeshData = ShapeCreator.createBox(1, 1, 1);
		var boxMaterial = Material.createMaterial(ShaderLib.simpleLit, 'mat');
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, boxMeshData, boxMaterial);
		boxEntity.transformComponent.transform.translation.setd(0, 0, 0);
		boxEntity.addToWorld();
	}

	function addLamp(goo, x, y, z) {
		var lampMeshData = ShapeCreator.createSphere(32, 32);
		var lampMaterial = Material.createMaterial(ShaderLib.simpleColored, '');
		lampMaterial.uniforms.color = [1.0, 0.8, 0.1];
		var lampEntity = EntityUtils.createTypicalEntity(goo.world, lampMeshData, lampMaterial);

		var light = new PointLight();
		light.range = 10;
		lampEntity.setComponent(new LightComponent(light));
		lampEntity.transformComponent.transform.translation.setd(x, y, z);
		lampEntity.addToWorld();

		addHalo(goo, x, y, z);
	}

	function addLamps(goo) {
		var nLamps = 5;
		for(var i = 0; i < nLamps; i++) {
			addLamp(goo, (i - ((nLamps - 1) / 2)) * 4, 5, 0);
		}
	}

	function addCamera(goo) {
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
			spherical : new Vector3(60, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function flatwaterAndParticlesDemo(goo) {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		addCamera(goo);
		addLamps(goo);

		addBox(goo);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		flatwaterAndParticlesDemo(goo);
	}

	init();
});

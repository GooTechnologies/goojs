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
	'goo/entities/components/LightComponent',
	'goo/entities/components/CameraDebugComponent',
	'goo/entities/systems/PortalSystem',
	'goo/entities/components/PortalComponent'
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
	LightComponent,
	CameraDebugComponent,
	PortalSystem,
	PortalComponent
	) {
	'use strict';

	function addPortalSystem(goo) {
		var renderingSystem = goo.world.getSystem('RenderSystem');
		var renderer = goo.renderer;
		goo.world.setSystem(new PortalSystem(renderer, renderingSystem));
	}

	function addPortal(goo, camera, x, y, z, dim) {
		var quadMeshData = ShapeCreator.createQuad(dim, dim);
		var quadMaterial = Material.createMaterial(ShaderLib.texturedLit, '');
		var quadEntity = EntityUtils.createTypicalEntity(goo.world, quadMeshData, quadMaterial);
		quadEntity.transformComponent.transform.translation.set(x, y, z);
		quadEntity.setComponent(new PortalComponent(camera));
		quadEntity.addToWorld();
	}

	function addSpheres(goo, nSpheres) {
		var sphereMeshData = ShapeCreator.createSphere(32, 32);

		for(var i = 0; i < nSpheres; i++) {
			for(var j = 0; j < nSpheres; j++) {
				var sphereMaterial = Material.createMaterial(ShaderLib.simpleColored, 'SphereMaterial' + i + '_' + j);
				sphereMaterial.uniforms.color = [i / nSpheres, j / nSpheres, 0.3];
				var sphereEntity = EntityUtils.createTypicalEntity(goo.world, sphereMeshData, sphereMaterial);
				sphereEntity.transformComponent.transform.translation.set(i - nSpheres/2, j - nSpheres/2, 0);
				sphereEntity.addToWorld();
			}
		}
	}

	function addSpinningCamera(goo, rotationOffset) {
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("SpinningCameraEntity");

		cameraEntity.setComponent(new CameraComponent(camera));

		var radius = 10;
		cameraEntity.setComponent(new ScriptComponent({
			run: function (entity) {
				entity.transformComponent.transform.translation.set(
					Math.cos(goo.world.time + rotationOffset) * radius,
					0,
					Math.sin(goo.world.time + rotationOffset) * radius
				);
				entity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
				entity.transformComponent.setUpdated();
			}
		}));

		// cameraEntity.setComponent(new CameraDebugComponent());

		cameraEntity.addToWorld();

		return camera;
	}

	function addUserCamera(goo) {
		var camera = new Camera(45, 1, 1, 1000);

		var cameraEntity = goo.world.createEntity("UserCameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);

		var cameraComponent = new CameraComponent(camera);
		cameraComponent.isMain = true;
		cameraEntity.setComponent(cameraComponent);

		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(25, Math.PI / 4, 0)
		}));
		cameraEntity.setComponent(scripts);

		cameraEntity.addToWorld();
	}

	function addLight(goo) {
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(100, 100, 100);
		lightEntity.addToWorld();
	}

	function portalDemo(goo) {
		// basic setup
		addSpheres(goo, 15);
		addLight(goo);
		addUserCamera(goo);

		// create 2 more cameras
		var camera1 = addSpinningCamera(goo, 0);
		var camera2 = addSpinningCamera(goo, Math.PI/8);

		// add the portal system tot the world
		addPortalSystem(goo);

		// add portals
		addPortal(goo, camera1, -3, 0, 2, 5);
		addPortal(goo, camera2,  3, 0, 2, 5);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		portalDemo(goo);
		window.goo = goo;
	}

	init();
});

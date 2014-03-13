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
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/entities/SystemBus',
	'goo/debug/FrustumViewer'
], function (
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
	PointLight,
	LightComponent,
	SystemBus,
	FrustumViewer
	) {
	'use strict';

	var cameraState = {
		spin: true,
		angle: 0,
		mainCameraId: 1
	};

	function setMainCamera(id, cameraEntities) {
		var mainCamera = cameraEntities[id].getComponent('CameraComponent').camera;
		SystemBus.emit('goo.setCurrentCamera', {
			camera: mainCamera,
			entity: cameraEntities[id]
		});
	}

	function frustumViewerDemo(goo) {
		// add spheres to have the cameras view them
		var sphereMeshData = ShapeCreator.createSphere(32, 32);

		var nSpheres = 15;
		for(var i = 0; i < nSpheres; i++) {
			for(var j = 0; j < nSpheres; j++) {
				var sphereMaterial = new Material(ShaderLib.simpleColored, 'SphereMaterial' + i + '_' + j);
				sphereMaterial.uniforms.color = [i / nSpheres, j / nSpheres, 0.3];
				var sphereEntity = goo.world.createEntity(sphereMeshData, sphereMaterial);
				sphereEntity.transformComponent.transform.translation.set(i - nSpheres/2, j - nSpheres/2, 0);
				sphereEntity.addToWorld();
			}
		}

		// add light
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(100, 100, 100);
		lightEntity.addToWorld();

		document.body.addEventListener('keypress', function(e) {
			switch(e.keyCode) {
				case 49:
					if(cameraState.mainCameraId === 1) {
						setMainCamera(0, [camera1Entity, camera2Entity]);
						cameraState.mainCameraId = 0;
					}
					break;
				case 50:
					if(cameraState.mainCameraId === 0) {
						setMainCamera(1, [camera1Entity, camera2Entity]);
						cameraState.mainCameraId = 1;
					}
					break;
				case 51:
					cameraState.spin = !cameraState.spin;
					break;
				default:
					console.log('Keys 1, 2 switch main camera; key 3 starts/stops the spinning of camera 1');
			}
		});

		// camera 1 - spinning
		var camera1 = new Camera(45, 1, 1, 1000);
		var camera1Entity = goo.world.createEntity("CameraEntity");
		camera1Entity.transformComponent.transform.translation.set(0, 0, 3);
		camera1Entity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		camera1Entity.setComponent(new CameraComponent(camera1));
		camera1Entity.addToWorld();

		camera1Entity.setComponent(new ScriptComponent({
			run: function (entity) {
				if(cameraState.spin) {
					cameraState.angle += 0.01;
					entity.transformComponent.transform.setRotationXYZ(
						cameraState.angle,
						0,
						0);
					entity.transformComponent.setUpdated();
				}
			}
		}));

		// camera 2 - main, with orbit cam control script
		var camera2 = new Camera(45, 1, 1, 1000);
		var camera2Entity = goo.world.createEntity("CameraEntity");
		camera2Entity.transformComponent.transform.translation.set(0, 0, 3);
		camera2Entity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		var camera2Component = new CameraComponent(camera2);
		camera2Component.isMain = true;
		camera2Entity.setComponent(camera2Component);
		camera2Entity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(25, Math.PI / 4, 0)
		}));
		camera2Entity.setComponent(scripts);

		// attach frustums
		FrustumViewer.attachGuide(camera1Entity);
		FrustumViewer.attachGuide(camera2Entity);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		frustumViewerDemo(goo);
	}

	init();
});

require([
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/ShapeCreator',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/cannon/CannonSystem',
	'goo/addons/cannon/CannonComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent'
], function (
	GooRunner,
	EntityUtils,
	Material,
	Camera,
	CameraComponent,
	ShapeCreator,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	CannonSystem,
	CannonComponent,
	PointLight,
	LightComponent
) {
	"use strict";

	var resourcePath = "../../resources";

	function init() {
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var cannonSystem = new CannonSystem();
		goo.world.setSystem(cannonSystem);
		
		function addPrimitives() {
			for (var i=0;i<20;i++) {
				var x = Math.random() * 16 - 8;
				var y = Math.random() * 16 + 8;
				var z = Math.random() * 16 - 8;
				if (Math.random() < 0.5) {
					var boxEntity = createEntity(goo, ShapeCreator.createBox(1+Math.random()*2, 1+Math.random()*2, 1+Math.random()*2), {
						mass: 1
					});
					boxEntity.transformComponent.transform.translation.set(x, y, z);
				} else {
					var sphereEntity = createEntity(goo, ShapeCreator.createSphere(10, 10, 1+Math.random()), {
						mass: 1
					});
					sphereEntity.transformComponent.transform.translation.set(x, y, z);
				}
			}
		}
		
		addPrimitives();
		
		document.addEventListener('keypress', addPrimitives, false);
		
		// var torusEntity = createEntity(goo, ShapeCreator.createTorus(6, 6, 1, 2), {
		// 	mass: 1
		// });
		// torusEntity.transformComponent.transform.translation.set(-2, 8, 0);

		var floorEntity = createEntity(goo, ShapeCreator.createBox(5, 5, 5), {
			mass: 0
		});
		floorEntity.transformComponent.transform.translation.y = -7.5;

		floorEntity = createEntity(goo, ShapeCreator.createBox(20, 10, 1), {
			mass: 0
		});
		floorEntity.transformComponent.transform.translation.set(0,-5,10);
		floorEntity = createEntity(goo, ShapeCreator.createBox(20, 10, 1), {
			mass: 0
		});
		floorEntity.transformComponent.transform.translation.set(0,-5,-10);
		floorEntity = createEntity(goo, ShapeCreator.createBox(1, 10, 20), {
			mass: 0
		});
		floorEntity.transformComponent.transform.translation.set(10,-5,0);
		floorEntity = createEntity(goo, ShapeCreator.createBox(1, 10, 20), {
			mass: 0
		});
		floorEntity.transformComponent.transform.translation.set(-10,-5,0);

		var planeEntity = createEntity(goo, ShapeCreator.createQuad(1000, 1000, 100, 100), {
			mass: 0
		});
		planeEntity.transformComponent.transform.translation.y = -10;
		planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI/2, 0, 0);

		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(0, 100, -10);
		lightEntity.addToWorld();

		var camera = new Camera(45, 1, 0.1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(40, 0, Math.PI/4)
		}));
		cameraEntity.setComponent(scripts);
		cameraEntity.addToWorld();
	}

	function createEntity(goo, meshData, settings) {
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.setTexture('DIFFUSE_MAP', texture);
		entity.meshRendererComponent.materials.push(material);
		entity.setComponent(new CannonComponent(settings));
		entity.addToWorld();
		return entity;
	}

	init();
});

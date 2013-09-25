require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/renderer/Material',
	'goo/entities/GooRunner',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/entities/components/LightComponent',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/renderer/shaders/ShaderLib'
], function (
	Material,
	GooRunner,
	TextureCreator,
	ScriptComponent,
	ShapeCreator,
	EntityUtils,
	LightComponent,
	PointLight,
	Camera,
	CameraComponent,
	OrbitCamControlScript,
	Vector3,
	ShaderLib
) {
	"use strict";

	var resourcePath = "../../resources";

	function createBox(x, y, z, textureUrl, goo) {
		var meshData = ShapeCreator.createBox(x, y, z, 1, 1);
		var box = EntityUtils.createTypicalEntity(goo.world, meshData);
		var texture = new TextureCreator({
			verticalFlip : true
		}).loadTexture2D(resourcePath + textureUrl);

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(ShaderLib.texturedLit, 'BoxShader');
		material.setTexture('DIFFUSE_MAP', texture);

		box.meshRendererComponent.materials.push(material);
		box.addToWorld();
		return box;
	}

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 5000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 5, 60);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(700, Math.PI / 2, 0),
			lookAtPoint: new Vector3(0,200,0)
		}));
		cameraEntity.setComponent(scripts);
		cameraEntity.addToWorld();

		// Setup light
		var light = new PointLight();
		light.range = 2000;
		var entity = goo.world.createEntity('Light1');
		entity.setComponent(new LightComponent(light));
		var transformComponent = entity.transformComponent;
		transformComponent.transform.translation.x = 0;
		transformComponent.transform.translation.y = 1000;
		transformComponent.transform.translation.z = 0;
		entity.addToWorld();

		var palms = [];
		for (var i = 0; i < 3; i++) {
			var box = createBox(80, 80, 20, '/Pot_Diffuse.dds', goo);
			palms.push(box);
		}
		var boxes = [];
		for (var i = 0; i < 20; i++) {
			var box = createBox(20, 20, 100, '/Pot_Diffuse.dds', goo);
			boxes.push(box);
		}

		var Leap = window.Leap;
		Leap.loop(function(frame) {
			for (var j = 0; j < palms.length; j++) {
				var box = palms[j];
				box.skip = true;
			}
			for (var j = 0; j < boxes.length; j++) {
				var box = boxes[j];
				box.skip = true;
			}

			var index = 0;
			for (var i = 0, len = frame.hands.length; i < len; i++) {
				var hand = frame.hands[i];

				var tipPosition = hand.palmPosition;
				var direction = hand.palmNormal;

				var box = palms[i];
				box.skip = false;
				box.transformComponent.setTranslation(tipPosition[0],tipPosition[1],tipPosition[2]);
				var dir = new Vector3(direction);
				dir.add(tipPosition);
				box.transformComponent.lookAt(dir, Vector3.UNIT_Z);

				for (var j = 0; j < hand.fingers.length; j++) {
					var point = hand.fingers[j];
					var tipPosition = point.tipPosition;
					var direction = point.direction;

					var box = boxes[index++];
					box.skip = false;
					box.transformComponent.setTranslation(tipPosition[0],tipPosition[1],tipPosition[2]);
					var dir = new Vector3(direction);
					dir.add(tipPosition);
					box.transformComponent.lookAt(dir, Vector3.UNIT_Y);
				}
			}
		});
	}

	init();
});

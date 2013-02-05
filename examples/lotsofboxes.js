require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/GooRunner', 'goo/entities/EntityUtils', 'goo/renderer/Material', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/shapes/ShapeCreator', 'goo/renderer/TextureCreator',
		'goo/entities/components/ScriptComponent'], function(GooRunner, EntityUtils, Material, Camera, CameraComponent, ShapeCreator, TextureCreator,
	ScriptComponent) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(Material.shaders.texturedLit, 'BoxShader');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.textures.push(texture);

		var material2 = new Material('TestMaterial');
		material2.shader = Material.createShader(Material.shaders.textured, 'BoxShader');
		var texture2 = new TextureCreator().loadTexture2D(resourcePath + '/checkerboard.png');
		material2.textures.push(texture2);

		// Add boxes
		var rc4Rand = new Rc4Random("seed");
		for ( var i = 0; i < 200; i++) {
			var x = rc4Rand.getRandomNumber() * 100 - 50;
			var y = rc4Rand.getRandomNumber() * 100 - 50;
			var z = rc4Rand.getRandomNumber() * 100 - 250;
			if (rc4Rand.getRandomNumber() > 0.5) {
				createBoxEntity(goo, material, x, y, z);
			} else {
				createBoxEntity(goo, material2, x, y, z);
			}
		}

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	function createBoxEntity(goo, material, x, y, z) {
		var meshData = ShapeCreator.createBox(20, 20, 20);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.transformComponent.transform.translation.set(x, y, z);
		entity.name = "Box";
		entity.meshRendererComponent.materials.push(material);
		entity.addToWorld();
		return entity;
	}

	function Rc4Random(seed) {
		var keySchedule = [];
		var keySchedule_i = 0;
		var keySchedule_j = 0;

		function init(seed) {
			for ( var i = 0; i < 256; i++)
				keySchedule[i] = i;

			var j = 0;
			for ( var i = 0; i < 256; i++) {
				j = (j + keySchedule[i] + seed.charCodeAt(i % seed.length)) % 256;

				var t = keySchedule[i];
				keySchedule[i] = keySchedule[j];
				keySchedule[j] = t;
			}
		}
		init(seed);

		function getRandomByte() {
			keySchedule_i = (keySchedule_i + 1) % 256;
			keySchedule_j = (keySchedule_j + keySchedule[keySchedule_i]) % 256;

			var t = keySchedule[keySchedule_i];
			keySchedule[keySchedule_i] = keySchedule[keySchedule_j];
			keySchedule[keySchedule_j] = t;

			return keySchedule[(keySchedule[keySchedule_i] + keySchedule[keySchedule_j]) % 256];
		}

		this.getRandomNumber = function() {
			var number = 0;
			var multiplier = 1;
			for ( var i = 0; i < 8; i++) {
				number += getRandomByte() * multiplier;
				multiplier *= 256;
			}
			return number / 18446744073709551616;
		}
	}

	init();
});

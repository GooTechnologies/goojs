require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/GooRunner', 'goo/entities/EntityUtils', 'goo/renderer/Material', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/shapes/ShapeCreator', 'goo/renderer/TextureCreator',
		'goo/entities/components/ScriptComponent', "goo/entities/Entity", "goo/entities/components/TransformComponent",
		"goo/entities/components/CSSTransformComponent", 'goo/math/Vector3', 'goo/scripts/BasicControlScript', 'goo/math/MathUtils',
		'goo/scripts/WASDControlScript', 'goo/scripts/MouseLookControlScript', 'goo/renderer/shaders/ShaderLib'], function(GooRunner, EntityUtils, Material, Camera, CameraComponent, ShapeCreator, TextureCreator,
	ScriptComponent, Entity, TransformComponent, CSSTransformComponent, Vector3, BasicControlScript, MathUtils, WASDControlScript, MouseLookControlScript, ShaderLib) {
	"use strict";

	var resourcePath = "../resources";

	function main() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = "goo";
		document.body.appendChild(goo.renderer.domElement);
		goo.renderer.setClearColor(0.1,0.1,0.1,1.0);

		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(new Camera(45, 1, 1, 10000)));
		cameraEntity.transformComponent.transform.translation.set(0, 0, 1000);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.addToWorld();

		var scripts = new ScriptComponent();
		scripts.scripts.push(new WASDControlScript({
			domElement : document.documentElement,
			walkSpeed : 700.0,
			crawlSpeed : 200.0
		}));
		scripts.scripts.push(new MouseLookControlScript({
			domElement : document.documentElement
		}));
		cameraEntity.setComponent(scripts);

		var parentEntity = goo.world.createEntity('parent');
		parentEntity.addToWorld();
		for ( var i = 0; i < 40; i++) {
			var x = Math.random() * 1600 - 800;
			var y = Math.random() * 1600 - 800;
			var z = Math.random() * 1600 - 800;

			var boxEntity = createBoxEntity(goo);
			boxEntity.transformComponent.transform.translation.x = x;
			boxEntity.transformComponent.transform.translation.y = y;
			boxEntity.transformComponent.transform.translation.z = z;

//			var element = document.createElement("IFRAME");
//			element.setAttribute("src", "http://www.xn--frken-ur-o4a.se/");
			var element = document.createElement('div');
			element.className = 'object assembly';

			var number = document.createElement('div');
			number.className = 'number';
			number.textContent = 'Goo Rocks!';
			element.appendChild(number);

			boxEntity.setComponent(new CSSTransformComponent(element));

			boxEntity.setComponent(new ScriptComponent({
				offset : Math.random()*100,
				run : function(entity) {
					var time = goo.world.time + this.offset;
					entity.transformComponent.transform.rotation.x = -time * 0.3;
					entity.transformComponent.transform.rotation.y = -time * 0.4;
					entity.transformComponent.transform.rotation.z = -time * 0.5;
					entity.transformComponent.setUpdated();
				}
			}));

			boxEntity.addToWorld();

			parentEntity.transformComponent.attachChild(boxEntity.transformComponent);
		}

		parentEntity.setComponent(new ScriptComponent({
			run : function(entity) {
				var time = goo.world.time;
				entity.transformComponent.transform.rotation.y = time * 0.3;
				entity.transformComponent.setUpdated();
			}
		}));
	}

	function createBoxEntity(goo) {
		var meshData = ShapeCreator.createBox(90, 50, 30);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.name = "Box";

		var material = new Material('TestMaterial');
		material.materialState = {
			ambient : {
				r : 0.4,
				g : 0.4,
				b : 0.4,
				a : 1.0
			},
			diffuse : {
				r : 1.0,
				g : 1.0,
				b : 1.0,
				a : 1.0
			},
			emissive : {
				r : 0.0,
				g : 0.0,
				b : 0.0,
				a : 1.0
			},
			specular : {
				r : 0.7,
				g : 0.7,
				b : 0.7,
				a : 1.0
			},
			shininess : 16.0
		};
		material.shader = Material.createShader(ShaderLib.texturedLit, 'BoxShader');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.textures.push(texture);

		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	main();
});

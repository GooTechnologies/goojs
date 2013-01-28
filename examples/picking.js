require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/math/Vector2', 'goo/scripts/BasicControlScript', 'goo/math/Ray', 'goo/entities/systems/PickingSystem'], function(World, Entity, System, TransformSystem, RenderSystem,
	TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, Vector2,
	BasicControlScript, Ray, PickingSystem) {
	"use strict";

	var material;
	var picked = null;

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		material = Material.createMaterial(Material.shaders.textured);
		var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
		var texture = new Texture(colorInfo, null, 2, 2);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';
		texture.generateMipmaps = false;
		material.textures.push(texture);

		createShapes(goo);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 10);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		
		// Add PickingSystem
		var picking = new PickingSystem();
		goo.world.setSystem(picking);
		picking.onPick = function(pickedList) {
			if (pickedList && pickedList.length) {
				picked = pickedList[0].entity;
			} else {
				picked = null;
			}
		};

		goo.callbacks.push(function(tpf) {
			if (picked) {
				var val = Math.abs(Math.sin(goo.world.time))+ 0.5;
				picked.transformComponent.transform.scale.set(val,val,val);
			}
		});
		
		document.addEventListener('mousedown', function(event) {
			event.preventDefault();
			event.stopPropagation();

			var mouseDownX = event.pageX;
			var mouseDownY = event.pageY;

			var worldPos = new Vector3();
			var screenPos = new Vector2();

			camera.getWorldCoordinates(mouseDownX, mouseDownY, goo.renderer.viewportWidth, goo.renderer.viewportHeight, 0, worldPos);
			console.log('z=0, screen coords: ' + mouseDownX + ',' + mouseDownY);
			console.log('z=0, world coords: ' + worldPos.x + ',' + worldPos.y + ',' + worldPos.z);
			camera.getScreenCoordinates(worldPos, goo.renderer.viewportWidth, goo.renderer.viewportHeight, screenPos);
			console.log('z=0, calculated screen coords: ' + screenPos.x + ',' + screenPos.y);

			camera.getWorldCoordinates(mouseDownX, mouseDownY, goo.renderer.viewportWidth, goo.renderer.viewportHeight, 1, worldPos);
			console.log('z=1, screen coords: ' + mouseDownX + ',' + mouseDownY);
			console.log('z=1, world coords: ' + worldPos.x + ',' + worldPos.y + ',' + worldPos.z);
			camera.getScreenCoordinates(worldPos, goo.renderer.viewportWidth, goo.renderer.viewportHeight, screenPos);
			console.log('z=1, calculated screen coords: ' + screenPos.x + ',' + screenPos.y);

			var ray = new Ray();
			camera.getPickRay(mouseDownX, mouseDownY, goo.renderer.viewportWidth, goo.renderer.viewportHeight, ray);
			console.log('Ray: origin = ' + ray.origin.x + ',' + ray.origin.y + ',' + ray.origin.z + ' direction = ' + ray.direction.x + ','
				+ ray.direction.y + ',' + ray.direction.z);
			
			// Ask all appropriate world entities if they've been picked
			picking.pickRay = ray;
			picking._process();
		}, false);
	}

	// Create simple quad
	function createShapes(goo) {
		createMesh(goo, ShapeCreator.createSphere(16, 16, 2), -10, 0, -30);
		createMesh(goo, ShapeCreator.createBox(3, 3, 3), -10, 10, -30);
		createMesh(goo, ShapeCreator.createQuad(3, 3), 0, -7, -20);
		createMesh(goo, ShapeCreator.createTorus(16, 16, 1, 3), 0, 0, -30);
	}

	function createMesh(goo, meshData, x, y, z) {
		var world = goo.world;

		// Create entity
		var entity = world.createEntity();

		entity.transformComponent.transform.translation.set(x, y, z);

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		entity.setComponent(new ScriptComponent(new BasicControlScript()));

		entity.addToWorld();
	}

	init();
});

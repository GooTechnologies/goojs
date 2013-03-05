
require({
    baseUrl : './',
    paths : {
        goo : '/js/goo'
    }
});
require(
	[
		'goo/entities/GooRunner',
		'goo/entities/EntityUtils',
		'goo/renderer/Material',
		'goo/renderer/Camera',
		'goo/entities/components/CameraComponent',
		'goo/entities/components/ScriptComponent',
		'goo/shapes/ShapeCreator',
		'goo/renderer/TextureCreator',
		'goo/scripts/MouseLookControlScript',
		'goo/scripts/WASDControlScript',
		'goo/math/Vector3',
		'goo/renderer/shaders/ShaderLib',
		'goo/entities/systems/OcclusionCullingSystem',
		'goo/entities/components/OccluderComponent',
		'goo/loaders/JSONImporter',
		'goo/renderer/bounds/BoundingBox'
	],
	function (
		GooRunner,
		EntityUtils,
		Material,
		Camera,
		CameraComponent,
		ScriptComponent,
		ShapeCreator,
		TextureCreator,
		MouseLookControlScript,
		WASDControlScript,
		Vector3,
		ShaderLib,
		OcclusionCullingSystem,
		OccluderComponent,
		JSONImporter,
		BoundingBox
	) {
		'use strict';

		//-------- GLOBAL VARIABLES --------
		
			var resourcePath = '../resources';

		//----------------------------------

		function init() {

			var goo = new GooRunner({
				showStats : true,
				canvas : document.getElementById('goo')
			});

			// Add camera
			var camera = new Camera(90, 1, 1, 100);
			
			var cameraEntity = goo.world.createEntity('CameraEntity');

			cameraEntity.setComponent(new CameraComponent(camera));
			cameraEntity.setComponent(new ScriptComponent([new MouseLookControlScript(), new WASDControlScript({'crawlSpeed' : 2.0, 'walkSpeed' : 18.0})]));
			cameraEntity.addToWorld();

			buildScene(goo);

			camera.translation.set(0, 1.79, 20);

			setupRenderer(goo, camera);
		}


		function setupRenderer(goo, camera) {

			var debugcanvas = document.getElementById('debugcanvas');
			var debugContext = debugcanvas.getContext('2d');
			var imagedata = debugContext.createImageData(debugcanvas.width, debugcanvas.height);

			// Override the current renderList for rendering in the GooRunner.
			var occlusionCullingSystem = new OcclusionCullingSystem({"width": debugcanvas.width, "height": debugcanvas.height, "camera": camera});
			goo.world.setSystem(occlusionCullingSystem);
			goo.renderSystem.renderList = occlusionCullingSystem.renderList;
			//goo.world.getSystem('RenderSystem').renderList = occlusionCullingSystem.renderList;
			//goo.world.removeSystem('PartitioningSystem'); // remove the existing system performing view frustum culling.

			
			var storage = new Uint8Array(4 * debugcanvas.width * debugcanvas.height);
			var gl = goo.renderer.context;


			var clearColor = [0, 0, 0, 1.0];
			goo.renderer.setClearColor(clearColor[0],clearColor[1],clearColor[2],clearColor[3]);

			// Add the color data to the debug canvas
			goo.callbacks.push(function(tpf) {
				
				// console.time("readTime");
				//gl.readPixels(0, 0, debugcanvas.width, debugcanvas.height, gl.RGBA, gl.UNSIGNED_BYTE, storage);
				// console.timeEnd("readTime");
				//occlusionCullingSystem.renderer.calculateDifference(storage, clearColor);
				imagedata.data.set(occlusionCullingSystem.renderer.getColorData());
				debugContext.putImageData(imagedata, 0, 0);
			});
		}

		function buildScene(goo) {
			

			var translation = new Vector3(-10, 0, 0);
			translation.y = 1;
			var boxEntity = createBoxEntity(goo.world, translation);
			boxEntity.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));
			boxEntity.transformComponent.transform.scale.set(2,2,2);

			translation.x = 10;
			translation.y = 1;
			for (var i = 0; i < 10; i++) {

				var quad = createQuad(goo.world, translation, 2, 2);
				translation.z -= 1.0;
			}

			translation.x = 0;
			translation.z = -15;
			translation.y = 5;
			var wallW = 50;
			var wallH = 10;
			var bigQuad = createQuad(goo.world, translation, wallW, wallH);
			createBoundingSphereForEntity(goo.world, translation, bigQuad);
			// Adds occluder geometry , for this case it is exactly the same as the original geometry.
			bigQuad.setComponent(new OccluderComponent(ShapeCreator.createQuad(wallW, wallH))); 


			translation.x = -wallW / 2 + 2;
			translation.y = 3;
			translation.z = -20;
			var numberOfBoxes = wallW / 2;
			for (var columns = 0; columns < numberOfBoxes; columns++) {
				var box = createBoxEntity(goo.world, translation);
				box.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));
				createBoundingSphereForEntity(goo.world, translation, box); 
				translation.x += 2;
				translation.z += 0.3;
				
			}

			var size = 100;
			var height = 2;
			var floorEntity = createFloorEntity(goo.world, size, height);
			// Adds occluder geometry , for this case it is exactly the same as the original geometry.
			floorEntity.setComponent(new OccluderComponent(ShapeCreator.createBox(size, height, size)));


			// Build the special case , where corner sampling has to be made to determine occlusion
			translation.x = -30;
			translation.y = 0;
			translation.z = -5;

			// Bottom occluder
			translation.y = 0.5;
			var box = createBoxEntity(goo.world, translation);
			box.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));

			// Left 
			translation.y += 1.05;
			translation.z += 1.05;
			box = createBoxEntity(goo.world, translation);
			box.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));

			// MID
			translation.z -= 1.05;
			box = createBoxEntity(goo.world, translation);
			box.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));

			// RIGHT
			translation.z -= 1.05;
			box = createBoxEntity(goo.world, translation);
			box.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));

			// TOP
			translation.y += 1.05;
			translation.z += 1.05;
			box = createBoxEntity(goo.world, translation);
			box.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));

			// Test object
			translation.y -= 1.05;
			translation.x -= 3;
			var boxcolor = [1, 0, 0];
			box = createColoredBox(goo.world, translation, boxcolor, 2);
			box.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));
			createBoundingSphereForEntity(goo.world, translation, box);

			// Add entities with boundingbox as bound.
			translation.x = -10;
			translation.y = 5;
			translation.z = -20;
			addBoundingBoxToEntity(goo.world, translation, createTorus(goo.world, translation));

			translation.x = 0;
			translation.y = 0;
			translation.z = -5;
			
			addHead(goo, translation);

			var t = 0.0;
			goo.callbacks.push(function(tpf) {
				
				t += tpf;
				boxEntity.transformComponent.transform.translation.x += (0.2 * Math.sin(t));
				boxEntity.transformComponent.transform.translation.z += (0.4 * Math.cos(t));
				boxEntity.transformComponent.setUpdated();	

			});
		}

		function createTorus (world, translation) {
			var meshData = ShapeCreator.createTorus(16, 16);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'The Torus!';
			var material = new Material.createMaterial(ShaderLib.simpleLit, 'SimpleMaterial');
			entity.meshRendererComponent.materials.push(material);
			
			entity.addToWorld();
			return entity;
		}

		function addBoundingBoxToEntity (world, translation, entity) {
			entity.meshDataComponent.modelBound = new BoundingBox();
			entity.meshDataComponent.autoCompute = false;
			entity.meshDataComponent.modelBound.computeFromPoints(entity.meshDataComponent.meshData.getAttributeBuffer('POSITION'));
			createBoundingBoxRepresentation(world, translation, entity.meshDataComponent.modelBound.xExtent * 2, entity.meshDataComponent.modelBound.yExtent * 2, entity.meshDataComponent.modelBound.zExtent * 2);
		}

		function createBoundingBoxRepresentation(world, translation, w, h, z) {
			var meshData = ShapeCreator.createBox(w, h, z);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'BoundingBox';
			
			var material = new Material.createMaterial(ShaderLib.texturedLit, 'wirematOnBoundingBox');
			material.wireframe = true;
			entity.meshRendererComponent.materials.push(material);
			entity.addToWorld();
			return entity;
		}

		function createQuad(world, translation, width, height) {
			var meshData = ShapeCreator.createQuad(width, height);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'Quad';
			var material = new Material.createMaterial(ShaderLib.simpleLit, 'SimpleMaterial');
			entity.meshRendererComponent.materials.push(material);
			material.wireframe = true;
			entity.addToWorld();
			return entity;
		}

		function createFloorEntity(world, size, height)
		{

			var textureRepeats = Math.ceil(size * 0.2);
			var meshData = ShapeCreator.createBox(size, height, size, textureRepeats, textureRepeats);
			// var meshData = ShapeCreator.createQuad(size, size, textureRepeats, textureRepeats);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.y = -height/2;
			entity.name = 'Floor';
			
			var material = new Material.createMaterial(ShaderLib.texturedLit, 'FloorMaterial');
			
			// http://photoshoptextures.com/floor-textures/floor-textures.htm
			var texture = new TextureCreator().loadTexture2D(resourcePath + '/checkerboard.png');
			material.textures.push(texture);
			entity.meshRendererComponent.materials.push(material);
			entity.addToWorld();
			return entity;
		}

		function createBoxEntity(world, translation) {
			var meshData = ShapeCreator.createBox(1, 1, 1);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'Box';
			
			var material = new Material.createMaterial(ShaderLib.texturedLit, 'GooBoxMaterial');
			var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
			material.textures.push(texture);
			entity.meshRendererComponent.materials.push(material);
			entity.addToWorld();
			return entity;
		}

		function createColoredBox (world, translation, color, scale) {
			var meshData = ShapeCreator.createBox(scale, scale, scale);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'Box';
			
			var material = new Material.createMaterial(ShaderLib.simpleColored, 'ColoredBoxMaterial!');
			material.uniforms = {'color' : color}
			var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
			material.textures.push(texture);
			entity.meshRendererComponent.materials.push(material);
			entity.addToWorld();
			return entity;
		}

		function addHead(goo, translation) {
			var importer = new JSONImporter(goo.world);

			importer.load(resourcePath + '/head.model', resourcePath + '/', {
				onSuccess : function(entities) {
					for ( var i in entities) {
						entities[i].addToWorld();
					}
					var size = 0.2;
					entities[1].setComponent(new OccluderComponent(ShapeCreator.createBox(size, size, size)));
					entities[1].transformComponent.transform.translation.set(translation);
					entities[1].transformComponent.transform.translation.y += 2; // Translate origin to the bottom of the model.
					entities[1].transformComponent.transform.scale.set(10, 10, 10);
					
				},
				onError : function(error) {
					console.error(error);
				}
			});
		}

		function createBoundingSphereForEntity (world, translation, entity) {

			// Override boundingSystem process to get correct bounding radius.
			entity.meshDataComponent.autoCompute = false;
			entity.meshDataComponent.modelBound.computeFromPoints(entity.meshDataComponent.meshData.getAttributeBuffer('POSITION'));

			var radius = entity.meshDataComponent.modelBound.radius;
			var meshData = ShapeCreator.createSphere(16, 16, radius, null);
			var boundentity = EntityUtils.createTypicalEntity(world, meshData);
			boundentity.transformComponent.transform.translation.x = translation.x;
			boundentity.transformComponent.transform.translation.y = translation.y;
			boundentity.transformComponent.transform.translation.z = translation.z;
			boundentity.name = 'BoundingSphere';
			
			var material = new Material.createMaterial(ShaderLib.simpleColored, 'ColoredBoxMaterial!');
			material.uniforms = {'color': [1, 0, 0]};
			material.wireframe = true;
			boundentity.meshRendererComponent.materials.push(material);
			boundentity.addToWorld();
			return boundentity;
		}

		init();
	}
);

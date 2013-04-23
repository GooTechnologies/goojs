require.config({
    baseUrl : './',
    paths : {
        goo: "../src/goo",
        'goo/lib': '../lib'
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
        'goo/entities/components/OccludeeComponent',
		'goo/loaders/JSONImporter',
		'goo/renderer/bounds/BoundingBox',
		'goo/renderer/OcclusionPartitioner',
		'goo/loaders/SceneLoader',
		'goo/loaders/Loader',
		'goo/loaders/EntityLoader',
		'goo/loaders/MeshLoader',
		'goo/lib/rsvp.amd',
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
        OccludeeComponent,
		JSONImporter,
		BoundingBox,
		OcclusionPartitioner,
		SceneLoader,
		Loader,
		EntityLoader,
		MeshLoader,
		RSVP
	) {
		'use strict';

		//-------- GLOBAL VARIABLES --------

			var resourcePath = '../resources';
            var gui = null;
            var quadMaterial = new Material.createMaterial(ShaderLib.simpleLit, 'SimpleMaterial');

            var bbMaterial = new Material.createMaterial(ShaderLib.simpleLit, 'wirematOnBoundingBox');
            bbMaterial.wireframe = true;
            bbMaterial.wireframeColor = [0, 0.25, 0];

            var occlusionPartitioner, defaultPartitioner;



		//----------------------------------

		function init() {

			var goo = new GooRunner({
				showStats : true,
				canvas : document.getElementById('goo')
			});

            gui = new window.dat.GUI();
            gui.add(quadMaterial, 'wireframe');
            gui.addColor(bbMaterial, 'wireframeColor');

			// Add camera
			var camera = new Camera(90, 1, 1, 400);

			var cameraEntity = goo.world.createEntity('CameraEntity');

			cameraEntity.setComponent(new CameraComponent(camera));
			cameraEntity.setComponent(new ScriptComponent([new MouseLookControlScript(), new WASDControlScript({'crawlSpeed' : 2.0, 'walkSpeed' : 18.0})]));
			cameraEntity.transformComponent.transform.translation.set(0, 1.79, 10);
			cameraEntity.addToWorld();

			//buildScene(goo);
            // loadTestTriangle(goo);
            createHouses(goo);

			setupOcclusionCulling(goo, camera);
		}


		function setupOcclusionCulling (goo, camera) {

			var debugcanvas = document.getElementById('debugcanvas');
			var debugContext = debugcanvas.getContext('2d');

			// Override the current renderList for rendering in the GooRunner.

            // These values could maybe be read from the meshes loaded. Or just take enough...
            // TODO : I need 104 vertices at the moment, something might be wrong with the blender exporter.
            var maxNumberOfOccluderVertices = 104;
            var maxTrianglesPerOccluder = 32;
            var maxNumberOfOccluderIndices = 3 * maxTrianglesPerOccluder;
			occlusionPartitioner = new OcclusionPartitioner({
                "width": debugcanvas.width,
                "height": debugcanvas.height,
                "camera": camera,
                "maxVertCount": maxNumberOfOccluderVertices,
                "maxIndexCount": maxNumberOfOccluderIndices,
                "debugContext": debugContext
            });

            defaultPartitioner = goo.renderSystem.partitioner;
			goo.renderSystem.partitioner = occlusionPartitioner;

			var clearColor = [0, 0, 0, 1.0];
			goo.renderer.setClearColor(clearColor[0],clearColor[1],clearColor[2],clearColor[3]);
		}

		function buildScene(goo) {


			var translation = new Vector3(-10, 0, 0);
			translation.y = 1;
			var boxEntity = createBoxEntity(goo.world, translation);
			boxEntity.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));
			boxEntity.transformComponent.transform.scale.set(2,2,2);
			createBoundingSphereForEntity(goo.world, boxEntity);
			translation.x = 10;
			translation.y = 1;
			for (var i = 0; i < 10; i++) {
				createQuad(goo.world, translation, 2, 2);
				translation.z -= 1.0;
			}

			translation.x = 0;
			translation.z = -15.5;

			var wallW = 50;
			var wallH = 15;
			translation.y = wallH / 2;
			var bigQuad = createQuad(goo.world, translation, wallW, wallH);
			// Add occluder geometry component, in this case it is exactly the same as the original geometry.
			bigQuad.setComponent(new OccluderComponent(ShapeCreator.createQuad(wallW, wallH)));

			translation.z -= 8;
			//var longQuad = createColoredBox(goo.world, translation, [0, 1, 0], wallW * 0.7, wallH * 0.45, 2);
			//addBoundingBoxToEntity(goo.world, translation, longQuad);


			translation.x = -wallW / 2 + 2;
			translation.y = 2;
			translation.z = -20;
			var numberOfBoxes = wallW / 2;
			for (var columns = 0; columns < numberOfBoxes; columns++) {
				var box = createBoxEntity(goo.world, translation);
				box.setComponent(new OccluderComponent(ShapeCreator.createBox(1,1,1)));
				createBoundingSphereForEntity(goo.world, box);
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
			box = createColoredBox(goo.world, translation, boxcolor, 2, 2, 2);
			box.setComponent(new OccluderComponent(ShapeCreator.createBox(2,2,2)));
			//createBoundingSphereForEntity(goo.world, box);

			// Add entities with boundingbox as bound.
			translation.x = -10;
			translation.y = 7;
			translation.z = -20;
			var torus = createTorus(goo.world, translation);
			addBoundingBoxToEntity(goo.world, translation, torus);

			translation.x += 10;
			translation.z -= 5;
			var b1 = createColoredBox(goo.world, translation, [0, 1, 0], 4, 7, 2);
			addBoundingBoxToEntity(goo.world, translation, b1);

			translation.x += 10;
			translation.z -= 5;
			var b2 = createColoredBox(goo.world, translation, [1, 0, 0], 4, 3, 5);
			addBoundingBoxToEntity(goo.world, translation, b2);

			translation.x = 0;
			translation.y = 0;
			translation.z = -5;

			addHead(goo, translation);

			//createRoomArray(goo);

            createHouses(goo);

            loadTestTriangle(goo);

			goo.callbacks.push(function() {

				boxEntity.transformComponent.transform.translation.x += (0.2 * Math.sin(goo.world.time));
				boxEntity.transformComponent.transform.translation.z += (0.4 * Math.cos(goo.world.time));
				boxEntity.transformComponent.setUpdated();

				torus.transformComponent.transform.setRotationXYZ(goo.world.time, 0.5 * goo.world.time, 0);
				torus.transformComponent.setUpdated();

				b1.transformComponent.transform.setRotationXYZ(goo.world.time, 0.2 * goo.world.time, 0);
				b1.transformComponent.setUpdated();

				b2.transformComponent.transform.setRotationXYZ(goo.world.time, 0.7 * goo.world.time, 0);
				b2.transformComponent.transform.scale.y = 0.2 + Math.abs(Math.sin(goo.world.time));
				b2.transformComponent.transform.scale.x = 0.2 + Math.abs(Math.sin(2.0 * goo.world.time));
				b2.transformComponent.setUpdated();
			});
		}

		function createTorus (world, translation) {
			var meshData = ShapeCreator.createTorus(32, 32);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'The Torus!';
			var material = new Material.createMaterial(ShaderLib.texturedLit, 'TorusMaterial');

			var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
			material.textures.push(texture);

			entity.meshRendererComponent.materials.push(material);

			entity.addToWorld();
			return entity;
		}

		function addBoundingBoxToEntity (world, translation, entity) {
			entity.meshDataComponent.modelBound = new BoundingBox();
			entity.meshDataComponent.autoCompute = false;
			entity.meshDataComponent.modelBound.computeFromPoints(entity.meshDataComponent.meshData.getAttributeBuffer('POSITION'));
			createBoundingBoxRepresentation(world, entity);
		}


		function createBoundingBoxRepresentation(world, parentEntity) {
			var meshData = ShapeCreator.createBox(
				parentEntity.meshDataComponent.modelBound.xExtent * 2,
				parentEntity.meshDataComponent.modelBound.yExtent * 2,
				parentEntity.meshDataComponent.modelBound.zExtent * 2
			);
			var entity = EntityUtils.createTypicalEntity(world, meshData);

			parentEntity.transformComponent.attachChild(entity.transformComponent);

			entity.meshDataComponent.modelBound = new BoundingBox();
			entity.meshDataComponent.autoCompute = false;
			entity.meshDataComponent.modelBound.computeFromPoints(entity.meshDataComponent.meshData.getAttributeBuffer('POSITION'));
			entity.name = 'BoundingBox';

			entity.meshRendererComponent.cullMode = 'NeverOcclusionCull';
			entity.meshRendererComponent.materials.push(bbMaterial);
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
            entity.meshRendererComponent.materials.push(quadMaterial);
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

			var texture = new TextureCreator().loadTexture2D(resourcePath + '/fieldstone-c.jpg');
			//material.wireframe = true;
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

		function createColoredBox (world, translation, color, x, y, z) {
			var meshData = ShapeCreator.createBox(x, y, z);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'Box';

			var material = new Material.createMaterial(ShaderLib.simpleColored, 'ColoredBoxMaterial!');
			material.uniforms = {'color' : color};
			entity.meshRendererComponent.materials.push(material);
			entity.addToWorld();
			return entity;
		}

		function addHead(goo, translation) {
			var importer = new JSONImporter(goo.world);

			importer.load(resourcePath + '/head.model', resourcePath + '/', {
				onSuccess : function(entities) {
					entities[1].addToWorld();
					var size = 0.2;
					entities[1].setComponent(new OccluderComponent(ShapeCreator.createBox(size, size, size)));
					entities[1].transformComponent.transform.translation.set(translation);
					entities[1].transformComponent.transform.translation.y += 2; // Translate origin to the bottom of the model.
					entities[1].transformComponent.transform.scale.set(10, 10, 10);
					createBoundingSphereForEntity(goo.world, entities[1]);

				},
				onError : function(error) {
					console.error(error);
				}
			});
		}

        function loadTestTriangle(goo) {
            var loader = new Loader({'rootPath': resourcePath + '/blenderexport/'});
            var mLoader = new MeshLoader({'loader': loader});

            var triPromise = mLoader.load('Triangle.mesh');
            var boxPromise = mLoader.load('box.mesh');

            var material = new Material.createMaterial(ShaderLib.simpleColored,'RoomMaterial');
            material.uniforms = {'color': [1.0, 0, 0]};
            var translation = new Vector3(-1, 1.8, 7);

            var script = {
                run: function (entity) {
                    var transformComponent = entity.transformComponent;
                    entity.transformComponent.transform.setRotationXYZ(
                        0,
                        0,
                        goo.world.time * 0.2
                    );
                    transformComponent.setUpdated();
                }
            };

            RSVP.all([triPromise, boxPromise]).then(function (mesh) {
                var entity = EntityUtils.createTypicalEntity(goo.world, mesh[0]);
                entity.setComponent(new OccluderComponent(mesh[0]));
                entity.setComponent(new OccludeeComponent(mesh[0]), true);
                entity.meshRendererComponent.materials.push(material);
                entity.transformComponent.transform.translation.set(translation);



                entity.setComponent(new ScriptComponent(script));
                entity.addToWorld();

                translation.x += 5;
                entity = EntityUtils.createTypicalEntity(goo.world, mesh[1]);
                entity.setComponent(new OccluderComponent(mesh[1]));
                entity.setComponent(new OccludeeComponent(mesh[1]), true);
                entity.meshRendererComponent.materials.push(material);
                entity.transformComponent.transform.translation.set(translation);
                entity.addToWorld();
            });
        }

		function createRoomArray (goo) {
			var loader = new Loader({'rootPath': resourcePath + '/blenderexport/'});
			var mLoader = new MeshLoader({'loader': loader});

			var occPromise = mLoader.load('room_occluder.mesh');
            var roomPromise = mLoader.load('room.mesh');

			var material = new Material.createMaterial(ShaderLib.simpleLit,'RoomMaterial');
			material.uniforms = {'materialDiffuse': [0.6, 0, 0.8,1], 'materialSpecular': [1,0,0,1], 'materialAmbient': [0,0,0.15,1]};
			material.wireframe = false;

			var NUM_OF_ROOMS = 30;
			var translation = new Vector3(20, 35, 0);
			var roomDistance = 30;


			RSVP.all([occPromise, roomPromise]).then(function (meshes) {
				var occluderMesh = meshes[0];
				var roomMesh = meshes[1];

				for (var i = 0; i < NUM_OF_ROOMS; i++) {
					var entity = EntityUtils.createTypicalEntity(goo.world, roomMesh);
					entity.setComponent(new OccluderComponent(occluderMesh));
					entity.meshRendererComponent.materials.push(material);
					entity.transformComponent.transform.translation.set(translation);

                    entity.meshDataComponent.modelBound = new BoundingBox();
                    entity.meshDataComponent.autoCompute = false;
                    entity.meshDataComponent.modelBound.computeFromPoints(entity.meshDataComponent.meshData.getAttributeBuffer('POSITION'));

                    entity.addToWorld();

                    addBoundingBoxToEntity(goo.world, translation, entity);

					translation.x += roomDistance;
				}
			});
		}

        function createHouses(goo) {
            var loader = new Loader({'rootPath': resourcePath + '/blenderexport/'});
            var mLoader = new MeshLoader({'loader': loader});

            var occPromise = mLoader.load('box.mesh');
            var roomPromise = mLoader.load('house.mesh');

            var width = 50;
            var rows = 20;
            var cols = 20;
            var scale = 2;
            var distance = 8;
            distance *= scale;
            var translation = new Vector3(-width, 0, -25);
            var useBoundingBox = true;

            RSVP.all([occPromise, roomPromise]).then(function (meshes) {
                var occluderMesh = meshes[0];
                var roomMesh = meshes[1];

                for (var i = 0; i < rows; i++) {
                    for (var j = 0; j < cols; j++) {

                        var entity = EntityUtils.createTypicalEntity(goo.world, roomMesh);
                        entity.setComponent(new OccluderComponent(occluderMesh));
                        entity.setComponent(new OccludeeComponent(roomMesh, useBoundingBox));
                        entity.meshRendererComponent.materials.push(quadMaterial);
                        entity.transformComponent.transform.translation.set(translation);
                        entity.transformComponent.transform.scale.setd(scale, scale, scale);
                        entity.addToWorld();

                        translation.x += distance;
                    }
                    translation.x = -width;
                    translation.z += distance;
                }
            });


        }

		function createBoundingSphereForEntity (world, entity) {

			// Override boundingSystem process to get correct bounding radius.
			entity.meshDataComponent.autoCompute = false;
			entity.meshDataComponent.modelBound.computeFromPoints(entity.meshDataComponent.meshData.getAttributeBuffer('POSITION'));

			var radius = entity.meshDataComponent.modelBound.radius;
			var meshData = ShapeCreator.createSphere(12, 12, radius, null);
			var boundentity = EntityUtils.createTypicalEntity(world, meshData);

			entity.transformComponent.attachChild(boundentity.transformComponent);
			boundentity.meshRendererComponent.cullMode = 'NeverOcclusionCull';

			boundentity.name = 'BoundingSphere';
			var material = new Material.createMaterial(ShaderLib.simpleColored, 'Boundingsphere representation!');
			material.uniforms = {'color': [1, 0, 0]};
			material.wireframe = true;
			boundentity.meshRendererComponent.materials.push(material);
			boundentity.addToWorld();
			return boundentity;
		}

		init();
	}
);

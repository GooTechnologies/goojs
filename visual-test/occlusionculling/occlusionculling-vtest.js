require.config({
	baseUrl : './',
	paths : {
		"goo": "../../../src/goo"
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
		'goo/renderer/bounds/BoundingBox',
		'goo/renderer/OcclusionPartitioner',
		'goo/loaders/SceneLoader',
		'goo/loaders/Loader',
		'goo/loaders/EntityLoader',
		'goo/loaders/MeshLoader',
		'goo/util/rsvp',
		'goo/util/TangentGenerator',
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/renderer/light/PointLight',
		'goo/renderer/light/DirectionalLight',
		'goo/entities/components/LightComponent',
		'goo/shapes/Box',
		'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent',
		'goo/loaders/DynamicLoader'
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
		BoundingBox,
		OcclusionPartitioner,
		SceneLoader,
		Loader,
		EntityLoader,
		MeshLoader,
		RSVP,
		TangentGenerator,
		MeshData,
		Shader,
		PointLight,
		DirectionalLight,
		LightComponent,
		Box,
		MeshDataComponent,
		MeshRendererComponent,
		DynamicLoader
	) {
		'use strict';

		//-------- GLOBAL VARIABLES --------

			var resourcePath = '../resources/occlusionculling/';
			var gui = null;
			var occlusionPartitioner, defaultPartitioner;

			var occlusionCullingOnline = true;
			var partitionPicker = {
				'occlusionCullingOnline' : occlusionCullingOnline,
				'OC ON/OFF' : function () {
					if (occlusionCullingOnline) {
						goo.renderSystem.partitioner = defaultPartitioner;
						occlusionCullingOnline = false;
					} else {
						goo.renderSystem.partitioner = occlusionPartitioner;
						occlusionCullingOnline = true;
					}
				}
			};

			var goo;

		//----------------------------------

		function init() {
			goo = new GooRunner({
				showStats : true
			});

			goo.renderer.domElement.id = 'goo';
			document.body.appendChild(goo.renderer.domElement);
			goo.renderer.setClearColor(0.05, 0.05, 0.05, 1);

			// Add camera
			var camera = new Camera(90, 1, 1, 1000);

			var cameraEntity = goo.world.createEntity('CameraEntity');

			cameraEntity.setComponent(new CameraComponent(camera));
			var cameraScript = new ScriptComponent();
			cameraScript.scripts.push(new WASDControlScript({
				domElement: document.body
			}));
			cameraScript.scripts.push(new MouseLookControlScript({
				domElement: document.body
			}));
			cameraEntity.setComponent(cameraScript);
			cameraEntity.transformComponent.transform.translation.set(0, 1.79, 10);
			cameraEntity.addToWorld();

			setupOcclusionCulling(goo, camera);

			gui = new window.dat.GUI();
			gui.add(partitionPicker, 'OC ON/OFF');

			// Add a torch to the camera.
			var pointLight = new PointLight();
			pointLight.color.setd(1.0, 0.9, 0.3);
			pointLight.range = 90;
			pointLight.intensity = 0.4;
			cameraEntity.setComponent(new LightComponent(pointLight));

			var sun = new DirectionalLight();
			sun.direction.setd(0,-1,-1);
			sun.color.setd(0.8, 0.8, 1.0);
			sun.intensity = 1.0;
			var sunComponent = new LightComponent(sun);
			var sunEntity = goo.world.createEntity();
			sunEntity.setComponent(sunComponent);
			sunEntity.addToWorld();

			var sunfolder = gui.addFolder("Sun settings");
			sunfolder.add(sun, 'intensity', 0, 1);
			sunfolder.open();

			var environmentPath = resourcePath + '/Nalovardo/';
			var textureCube = new TextureCreator().loadTextureCube([
				environmentPath + 'negx.jpg',
				environmentPath + 'posx.jpg',
				environmentPath + 'negy.jpg',
				environmentPath + 'posy.jpg',
				environmentPath + 'negz.jpg',
				environmentPath + 'posz.jpg',
			]);

			var skyboxEntity = goo.world.createEntity('SkyBox');
			skyboxEntity.setComponent(new MeshDataComponent(new Box(10, 10, 10)));
			var meshRendererComponent = new MeshRendererComponent();
			var material = Material.createMaterial(texturedSkybox, 'test');
			material.cullState.cullFace = 'Front';
			material.depthState.enabled = false;
			material.renderQueue = 0;
			material.setTexture('CUBE_MAP', textureCube);
			meshRendererComponent.materials.push(material);
			meshRendererComponent.isPickable = false;
			skyboxEntity.setComponent(meshRendererComponent);
			skyboxEntity.addToWorld();
			cameraEntity.transformComponent.attachChild(skyboxEntity.transformComponent);

			createForest(goo);
		}

		function setupOcclusionCulling (goo, camera) {

			var WIDTH = 64;
			var HEIGHT = 32;

			var debugcanvas = document.createElement('canvas');
			debugcanvas.width = WIDTH;
			debugcanvas.height = HEIGHT;
			debugcanvas.id = "debugcanvas";
			document.body.appendChild(debugcanvas);
			var debugContext = debugcanvas.getContext('2d');

			// Override the current renderList for rendering in the GooRunner.

			// These values could maybe be read from the meshes loaded. Or just take enough...
			// TODO : I need 104 vertices at the moment, something might be wrong with the blender exporter.
			var maxNumberOfOccluderVertices = 104;
			var maxTrianglesPerOccluder = 32;
			var maxNumberOfOccluderIndices = 3 * maxTrianglesPerOccluder;
			occlusionPartitioner = new OcclusionPartitioner({
				"width": WIDTH,
				"height": HEIGHT,
				"camera": camera,
				"maxVertCount": maxNumberOfOccluderVertices,
				"maxIndexCount": maxNumberOfOccluderIndices,
				"debugContext": debugContext
			});

			defaultPartitioner = goo.renderSystem.partitioner;
			goo.renderSystem.partitioner = occlusionPartitioner;
		}

		function createForest(goo) {
			var groundSize = 10000;
			var textureRepeats = Math.ceil(groundSize);
			var groundMesh = ShapeCreator.createQuad(groundSize, groundSize, textureRepeats, textureRepeats);
			var groundEntity = EntityUtils.createTypicalEntity(goo.world, groundMesh);

			var groundMaterial = Material.createMaterial(ShaderLib.uber, 'GroundMaterial');
			groundMaterial.materialState.shininess = 0;
			groundMaterial.materialState.specular = [0.1, 0.1, 0.0, 1.0];
			var groundTexture = new TextureCreator().loadTexture2D(resourcePath + 'groundmoss.jpg');
			groundMaterial.setTexture("DIFFUSE_MAP", groundTexture);
			groundEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2,0,0);
			groundEntity.meshRendererComponent.materials.push(groundMaterial);
			groundEntity.addToWorld();

			var loader = new Loader({'rootPath': resourcePath + '/meshes/'});
			var mLoader = new MeshLoader({'loader': loader});

			var treeOccluderPromise = mLoader.load('treeoccluder.mesh.json');
			var treePromise = mLoader.load('tree.mesh.json');
			var housePromise = mLoader.load('lowres.mesh');
			var houseOccluderPromise = mLoader.load('occluder.mesh');
			var duckPromise = mLoader.load('duck.mesh');

			var treeMaterial = Material.createMaterial(ShaderLib.uber, 'TreeMaterial');
			var treeTexture = new TextureCreator().loadTexture2D(resourcePath + 'tree_texture.jpg');
			treeMaterial.setTexture("DIFFUSE_MAP", treeTexture);
			treeMaterial.materialState.shininess = 0;
			treeMaterial.materialState.specular = [0.1, 0.1, 0.0, 1.0];

			var duckMaterial = Material.createMaterial(ShaderLib.uber, 'DuckMat');
			var duckTexture = new TextureCreator().loadTexture2D(resourcePath + "ducktexture.jpg");
			duckMaterial.setTexture("DIFFUSE_MAP", duckTexture);
			duckMaterial.materialState.shininess = 90;

			var duckScript = {
				run: function (entity) {
					var t = entity._world.time;

					var transformComponent = entity.transformComponent;
					transformComponent.transform.translation.x = Math.sin(t * 1.0) * 10;
					transformComponent.transform.translation.y = 0;
					transformComponent.transform.translation.z = Math.cos(t * 1.0) * 10;
					transformComponent.setUpdated();
				}
			};

			var houseMaterial = Material.createMaterial(ShaderLib.uber, 'HouseMaterial');
			var houseDiffuse = new TextureCreator().loadTexture2D(resourcePath + 'stonehouse_texture.jpg');
			var houseNormal = new TextureCreator().loadTexture2D(resourcePath + 'normalbake.png');
			var houseSpecular = new TextureCreator().loadTexture2D(resourcePath + 'specularmap.png');
			houseMaterial.setTexture("DIFFUSE_MAP", houseDiffuse);
			houseMaterial.setTexture("NORMAL_MAP", houseNormal);
			houseMaterial.setTexture("SPECULAR_MAP", houseSpecular);

			var occluderFolder = gui.addFolder("Occluder Geometry");
			occluderFolder.add(treeMaterial, 'wireframe');
			occluderFolder.add(houseMaterial, 'wireframe');
			occluderFolder.open();

			var width = 85;
			var rows = 20;
			var cols = 20;
			var treeScale = 1.8;
			var distance = 13.5;
			distance *= treeScale;
			var treeHalfHeight = 5.2;
			var treeTranslation = new Vector3(-width, treeHalfHeight, 0);
			var useBoundingBox = true;

			RSVP.all([treeOccluderPromise, treePromise, housePromise, houseOccluderPromise, duckPromise]).then(function (meshes) {
				var treeOccluder = meshes[0];
				var treeMesh = meshes[1];
				var houseMesh = meshes[2];
				var houseOccluder = meshes[3];
				var duckMesh = meshes[4];

				TangentGenerator.addTangentBuffer(houseMesh, 0);

				for (var i = 0; i < rows; i++) {
					for (var j = 0; j < cols; j++) {
						var treeEntity = EntityUtils.createTypicalEntity(goo.world, treeMesh);
						treeEntity.setComponent(new OccluderComponent(treeOccluder));
						treeEntity.setComponent(new OccludeeComponent(treeMesh, useBoundingBox));
						treeEntity.meshRendererComponent.materials.push(treeMaterial);

						var randomScale = Math.random() * 0.3 + 0.7;
						randomScale *= treeScale;

						var randomRadian = Math.random() * Math.PI * 2.0;
						var randomRadius = Math.random() * distance * 0.4;
						var offsetX = randomRadius * Math.cos(randomRadian);
						var offsetZ = randomRadius * Math.sin(randomRadian);

						treeEntity.transformComponent.transform.translation.setd(treeTranslation.x + offsetX, treeHalfHeight * randomScale, treeTranslation.z + offsetZ);
						treeEntity.transformComponent.transform.scale.setd(randomScale, randomScale, randomScale);
						treeEntity.transformComponent.transform.setRotationXYZ(0, Math.random() * 180, 0);
						treeEntity.addToWorld();

						// Add a flying rubber duck to each tree.
						var duckEntity = EntityUtils.createTypicalEntity(goo.world, duckMesh);
						duckEntity.setComponent(new OccludeeComponent(duckMesh, useBoundingBox));
						duckEntity.transformComponent.parent = treeEntity.transformComponent;
						var duckscale = 0.2;
						duckEntity.transformComponent.transform.scale.setd(duckscale, duckscale, duckscale);
						duckEntity.transformComponent.transform.translation.setd(treeTranslation.x + offsetX, 0, treeTranslation.z + offsetZ);
						duckEntity.meshRendererComponent.materials.push(duckMaterial);
						duckEntity.setComponent(new ScriptComponent(duckScript));
						duckEntity.addToWorld();

						if (j % 2) {
							var houseEntity = EntityUtils.createTypicalEntity(goo.world, houseMesh);
							houseEntity.setComponent(new OccluderComponent(houseOccluder));
							houseEntity.setComponent(new OccludeeComponent(houseMesh, useBoundingBox));
							houseEntity.meshRendererComponent.materials.push(houseMaterial);
							var houseScale = Math.random() * 1.0 + 1.0;
							houseEntity.transformComponent.transform.translation.setd(treeTranslation.x - offsetX, 4.5 * houseScale, treeTranslation.z - offsetZ);
							houseEntity.transformComponent.transform.setRotationXYZ(0, Math.random() * 180, 0);
							houseEntity.transformComponent.transform.scale.setd(houseScale, houseScale, houseScale);
							houseEntity.addToWorld();
						}

						treeTranslation.x += distance;
					}
					treeTranslation.x = -width;
					treeTranslation.z += distance;
				}


			});
		}

		// Shader for skybox
		var texturedSkybox = {
			attributes: {
				vertexPosition: MeshData.POSITION,
				vertexNormal: MeshData.NORMAL,
			},
			uniforms: {
				viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX,
				cameraPosition: Shader.CAMERA,
				cubeMap: 'CUBE_MAP',
			},
			vshader: [
							'attribute vec3 vertexPosition;',
							'attribute vec3 vertexNormal;',

							'uniform mat4 viewProjectionMatrix;',
							'uniform mat4 worldMatrix;',
							'uniform vec3 cameraPosition;',

							'varying vec3 reflectionVector;',

							'void main(void) {',
							'       reflectionVector = normalize(cameraPosition - (worldMatrix * vec4(vertexPosition, 1.0)).xyz);',

							'       gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
							'}'
						].join('\n'),
			fshader: [
							'uniform samplerCube cubeMap;',
							'uniform float fader;',

							'varying vec3 reflectionVector;',

							'void main(void)',
							'{',
							'       vec4 cube = textureCube(cubeMap, reflectionVector);',
							'       gl_FragColor = cube;',
							'}'
						].join('\n')
		};

		init();
	}
);

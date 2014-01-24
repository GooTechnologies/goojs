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
    'goo/renderer/light/DirectionalLight',
    'goo/renderer/light/SpotLight',
    'goo/entities/components/LightComponent',
    'goo/shapes/TerrainSurface',
    'goo/shapes/Sphere',
    'goo/scripts/WASDControlScript',
    'goo/scripts/MouseLookControlScript',
    'goo/scripts/WorldFittedTerrainScript',
	'goo/entities/components/MovementComponent',
	'goo/scripts/GroundBoundMovementScript',
    'goo/renderer/TextureCreator',
    'goo/util/CanvasUtils'
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
    DirectionalLight,
    SpotLight,
    LightComponent,
    TerrainSurface,
    Sphere,
    WASDControlScript,
    MouseLookControlScript,
    WorldFittedTerrainScript,
	MovementComponent,
	GroundBoundMovementScript,
    TextureCreator,
    CanvasUtils
    ) {
    'use strict';

    var goo;
    var worldFittedTerrainScript = new WorldFittedTerrainScript();


    function addSpheres(goo, worldFittedTerrainScript, dims) {
        /*jshint loopfunc: true */
        var meshData = new Sphere(32, 32);

        var nSpheres = 4;
        var ak = Math.PI * 2 / nSpheres;
        for (var i = 0, k = 0; i < nSpheres; i++, k += ak) {
            var material = Material.createMaterial(ShaderLib.simpleColored, '');
            material.uniforms.color = [
                Math.cos(k) * 0.5 + 0.5,
                Math.cos(k + Math.PI / 3 * 2) * 0.5 + 0.5,
                Math.cos(k + Math.PI / 3 * 4) * 0.5 + 0.5
            ];
            var sphereEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material);
            sphereEntity.transformComponent.transform.translation.setd(i+dims.minX*0.5+dims.maxX*0.5, dims.maxY*0.5+dims.minY*0.5, dims.maxZ*0.5+dims.minZ*0.5);
			sphereEntity.transformComponent.transform.scale.setd(1, 5, 2);

			sphereEntity.setComponent(new MovementComponent());
			var groundBoundMovementScript = new GroundBoundMovementScript();
			groundBoundMovementScript.setTerrainSystem(worldFittedTerrainScript);

			var scripts = new ScriptComponent();
            (function(i) {
                scripts.scripts.push({
                    run: function(entity) {
                        var translation = entity.transformComponent.transform.translation;

                        translation.data[0] = Math.cos(World.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + dims.minX*0.5+dims.maxX*0.5;
                        translation.data[2] = Math.sin(World.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + dims.maxZ*0.5+dims.minZ*0.5;

                        entity.transformComponent.setUpdated();
                    }
                });
            })(i);
            scripts.scripts.push(groundBoundMovementScript);
            sphereEntity.setComponent(scripts);

            sphereEntity.addToWorld();

            var light1 = new PointLight();
            light1.color.set(0.1, 0.1,0.1);
            var light1Entity = goo.world.createEntity('light');
            light1Entity.setComponent(new LightComponent(light1));
            light1Entity.transformComponent.transform.translation.set( dims.minX*0.5+dims.maxX*0.50, 20+dims.maxY, dims.maxZ*0.5+dims.minZ*0.5);
            light1Entity.addToWorld();
        }
    }

	function addNormalPointers(goo, worldFittedTerrainScript, dims) {
		/*jshint loopfunc: true */
		var meshData = new Sphere(32, 32);

		var nSpheres = 20;
		var ak = Math.PI * 2 / nSpheres;
		for (var i = 0, k = 0; i < nSpheres; i++, k += ak) {
			var material = Material.createMaterial(ShaderLib.simpleColored, '');
			material.uniforms.color = [
				Math.cos(k/nSpheres) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 2) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 4) * 0.5 + 0.5
			];
			var sphereEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material);

			var px = dims.maxX*0.5+dims.minX*0.5;
			var pz = dims.minZ+(i/nSpheres*(dims.maxZ-dims.minZ));
			var py = worldFittedTerrainScript.getTerrainHeightAt([px, dims.minY, pz]);

			sphereEntity.transformComponent.transform.translation.setd(px,py,pz);
			sphereEntity.transformComponent.transform.scale.setd(0.3, 0.3, 3);

			var normal = worldFittedTerrainScript.getTerrainNormalAt([px, py, pz]);
			sphereEntity.transformComponent.transform.rotation.lookAt(normal, Vector3.UNIT_Y);
			sphereEntity.addToWorld();
		}
	}

    function buildTexturedGround(matrix, dimensions, id, gooWorld, txPath) {
        var meshData = new TerrainSurface(matrix, dimensions.maxX-dimensions.minX, dimensions.maxY-dimensions.minY, dimensions.maxZ-dimensions.minZ);
        var material = Material.createMaterial(ShaderLib.texturedLit, '');

        var texture = new TextureCreator().loadTexture2D(txPath);
        material.setTexture('DIFFUSE_MAP', texture);

        material.materialState.ambient = [
            0.310305785123966943,
            0.310305785123966943,
            0.386363636363636367,
            1
        ];
        material.materialState.diffuse = [
            0.25909090909090909,
            0.24909090909090909,
            0.29909090909090909,
            1
        ];
     //   material.cullState.frontFace = "CW";
        material.cullState.cullFace = "Back";
  //      material.cullState.enabled = false;
        //    emissive: materialData.uniforms.materialEmissive,
        material.materialState.specular = [0.0, 0.0, 0.0, 1];
        material.materialState.emissive = [0, 0, 0, 1];
        material.materialState.shininess = 0.1;

        var surfaceEntity = EntityUtils.createTypicalEntity(gooWorld, meshData, material, id);
        surfaceEntity.transformComponent.transform.translation.setd(dimensions.minX, dimensions.minY, dimensions.minZ);
        surfaceEntity.transformComponent.setUpdated();
        surfaceEntity.addToWorld();
    }

    function buildSurfaceMesh(matrix, dimensions, id, gooWorld) {
        var meshData =  new TerrainSurface(matrix, dimensions.maxX-dimensions.minX, dimensions.maxY-dimensions.minY, dimensions.maxZ-dimensions.minZ);
        var material = Material.createMaterial(ShaderLib.simpleLit, '');
        material.wireframe = true;
        var surfaceEntity = EntityUtils.createTypicalEntity(gooWorld, meshData, material, id);
        surfaceEntity.transformComponent.transform.translation.setd(dimensions.minX, dimensions.minY, dimensions.minZ);
        surfaceEntity.transformComponent.setUpdated();
        surfaceEntity.addToWorld();
    }

    function worldFittedTerrainScriptDemo() {
        var canvasUtils = new CanvasUtils();

        canvasUtils.loadCanvasFromPath('../../resources/heightmap_small.png', function(canvas) {
            var matrix = canvasUtils.getMatrixFromCanvas(canvas);

            var dim1 = {
                minX: 0,
                maxX: 50,
                minY: 45,
                maxY: 65,
                minZ: 0,
                maxZ: 50
            };

            var terrainData1 = worldFittedTerrainScript.addHeightData(matrix, dim1);

            buildSurfaceMesh(terrainData1.script.matrixData, terrainData1.dimensions, "terrain_mesh_1", goo.world);

            addSpheres(goo, worldFittedTerrainScript, dim1);
			addNormalPointers(goo, worldFittedTerrainScript, dim1);
            var dim2 = {
                minX: 50,
                maxX: 75,
                minY: 10,
                maxY: 30,
                minZ: 0,
                maxZ: 50
            };

            var terrainData2 = worldFittedTerrainScript.addHeightData(matrix, dim2);
            buildSurfaceMesh(terrainData2.script.matrixData, terrainData2.dimensions, "terrain_mesh_2", goo.world);
            addSpheres(goo, worldFittedTerrainScript, dim2);
			addNormalPointers(goo, worldFittedTerrainScript, dim2);

            var dim3 = {
                minX: -50,
                maxX: 0,
                minY: -10,
                maxY: 0,
                minZ: -50,
                maxZ: 0
            };

            var terrainData3 = worldFittedTerrainScript.addHeightData(matrix, dim3);
            buildTexturedGround(terrainData3.script.matrixData, terrainData3.dimensions, "terrain_mesh_3", goo.world, '../../resources/heightmap_small.png');
        //    buildSurfaceMesh(terrainData3.script.matrixData, terrainData3.dimensions, "terrain_mesh_3", goo.world);
            addSpheres(goo, worldFittedTerrainScript, dim3);
			addNormalPointers(goo, worldFittedTerrainScript, dim3);
            var dim4 = {
                minX: -40,
                maxX: 0,
                minY: 16,
                maxY: 21,
                minZ: -70,
                maxZ: 0
            };

            var terrainData4 = worldFittedTerrainScript.addHeightData(matrix, dim4);
            buildSurfaceMesh(terrainData4.script.matrixData, terrainData4.dimensions, "terrain_mesh_4", goo.world);
            addSpheres(goo, worldFittedTerrainScript, dim4);
			addNormalPointers(goo, worldFittedTerrainScript, dim4);



            // Add camera
            var camera = new Camera(45, 1, 1, 1000);
            var cameraEntity = goo.world.createEntity("CameraEntity");
            cameraEntity.transformComponent.transform.translation.set(0, 0, 20);
            cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Z);
            cameraEntity.setComponent(new CameraComponent(camera));
            cameraEntity.addToWorld();

            // Camera control set up
            var scripts = new ScriptComponent();
            scripts.scripts.push(new WASDControlScript({
                domElement : goo.renderer.domElement,
                walkSpeed : 25.0,
                crawlSpeed : 10.0
            }));
            scripts.scripts.push(new MouseLookControlScript({
                domElement : goo.renderer.domElement
            }));
        //    scripts.scripts.push(worldFittedTerrainScript);
            cameraEntity.setComponent(scripts);
        });



		canvasUtils.loadCanvasFromPath('../../resources/checker_slope.png', function(canvas) {
			var matrix = canvasUtils.getMatrixFromCanvas(canvas);

			var dim = {
				minX: 0,
				maxX: 20,
				minY: -1,
				maxY: 0,
				minZ: 0,
				maxZ: 20
			};

			var terrainData = worldFittedTerrainScript.addHeightData(matrix, dim);

		//	buildTexturedGround(terrainData.script.matrixData, terrainData.dimensions, "terrain_mesh_5", goo.world, '../../resources/check.png');
			buildSurfaceMesh(terrainData.script.matrixData, terrainData.dimensions, "terrain_mesh_5", goo.world);

			addSpheres(goo, worldFittedTerrainScript, dim);
			addNormalPointers(goo, worldFittedTerrainScript, dim);

		//	var matrix = canvasUtils.getMatrixFromCanvas(canvas);

			dim = {
				minX: 0,
				maxX: 20,
				minY: -30,
				maxY: -5,
				minZ: 0,
				maxZ: 20
			};

			var terrainData = worldFittedTerrainScript.addHeightData(matrix, dim);

				buildTexturedGround(terrainData.script.matrixData, terrainData.dimensions, "terrain_mesh_6", goo.world, '../../resources/check.png');
			//	buildSurfaceMesh(terrainData.script.matrixData, terrainData.dimensions, "terrain_mesh_5", goo.world);

			addSpheres(goo, worldFittedTerrainScript, dim);
			addNormalPointers(goo, worldFittedTerrainScript, dim);
		});

    }

    function init() {
        goo = new GooRunner();
        goo.renderer.domElement.id = 'goo';
        document.body.appendChild(goo.renderer.domElement);
		worldFittedTerrainScriptDemo(goo);
    }

    init();
});

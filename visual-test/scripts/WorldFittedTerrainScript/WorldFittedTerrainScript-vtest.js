require.config({
    paths: {
        "goo": "../../../src/goo"
    }
});

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
    'goo/shapes/Surface',
    'goo/shapes/Sphere',
    'goo/scripts/WASDControlScript',
    'goo/scripts/MouseLookControlScript',
    'goo/scripts/WorldFittedTerrainScript',
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
    Surface,
    Sphere,
    WASDControlScript,
    MouseLookControlScript,
    WorldFittedTerrainScript,
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
            scripts.scripts.push(worldFittedTerrainScript);
            sphereEntity.setComponent(scripts);

            sphereEntity.addToWorld();
        }
    }

    function addTerrainWithDimensions(matrix, dimensions) {
        worldFittedTerrainScript.addHeightData(matrix, dimensions, goo.world);
    }

    function WorldFittedTerrainScriptDemo() {
        var canvasUtils = new CanvasUtils();

        canvasUtils.loadCanvasFromPath('../../resources/heightmap_small.png', function(canvas) {
            var matrix = canvasUtils.getMatrixFromCanvas(canvas);

            var dim1 = {
                minX: 0,
                maxX: 50,
                minY: 0,
                maxY: 20,
                minZ: 0,
                maxZ: 50
            };

            addTerrainWithDimensions(matrix, dim1);
            addSpheres(goo, worldFittedTerrainScript, dim1);

            var dim2 = {
                minX: 50,
                maxX: 75,
                minY: 10,
                maxY: 30,
                minZ: 0,
                maxZ: 50
            };

            addTerrainWithDimensions(matrix, dim2);
            addSpheres(goo, worldFittedTerrainScript, dim2);
            var dim3 = {
                minX: -50,
                maxX: 0,
                minY: -10,
                maxY: 0,
                minZ: -50,
                maxZ: 0
            };

            addTerrainWithDimensions(matrix, dim3);
            addSpheres(goo, worldFittedTerrainScript, dim3);
            worldFittedTerrainScript.generateTerrainSurfaceMeshes(goo.world);

            var light1 = new PointLight();
            var light1Entity = goo.world.createEntity('light');
            light1Entity.setComponent(new LightComponent(light1));
            light1Entity.transformComponent.transform.translation.set(0, 100, 0);
            light1Entity.addToWorld();

            // Add camera
            var camera = new Camera(45, 1, 1, 1000);
            var cameraEntity = goo.world.createEntity("CameraEntity");
            cameraEntity.transformComponent.transform.translation.set(0, 0, 20);
            cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
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
            scripts.scripts.push(worldFittedTerrainScript);
            cameraEntity.setComponent(scripts);
        });
    }

    function init() {
        goo = new GooRunner();
        goo.renderer.domElement.id = 'goo';
        document.body.appendChild(goo.renderer.domElement);

        WorldFittedTerrainScriptDemo(goo);
    }

    init();
});

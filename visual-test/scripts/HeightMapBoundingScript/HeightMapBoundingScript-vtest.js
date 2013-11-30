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
	'goo/scripts/HeightMapBoundingScript',
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
	HeightMapBoundingScript,
	CanvasUtils
	) {
	'use strict';

	function addSpheres(goo, heightMapBoundingScript) {
		/*jshint loopfunc: true */
		var meshData = new Sphere(32, 32);

		var nSpheres = 10;
		var ak = Math.PI * 2 / nSpheres;
		for (var i = 0, k = 0; i < nSpheres; i++, k += ak) {
			var material = Material.createMaterial(ShaderLib.simpleColored, '');
			material.uniforms.color = [
				Math.cos(k) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 2) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 4) * 0.5 + 0.5
			];
			var sphereEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material);
			sphereEntity.transformComponent.transform.translation.setd(i, 0, 0);

			var scripts = new ScriptComponent();
			(function(i) {
				scripts.scripts.push({
					run: function(entity) {
						var translation = entity.transformComponent.transform.translation;

						translation.data[0] = Math.cos(World.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;
						translation.data[2] = Math.sin(World.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;

						entity.transformComponent.setUpdated();
					}
				});
			})(i);
			scripts.scripts.push(heightMapBoundingScript);
			sphereEntity.setComponent(scripts);

			sphereEntity.addToWorld();
		}
	}

	function heightMapBoundingScriptDemo(goo) {
		var canvasUtils = new CanvasUtils();

		canvasUtils.loadCanvasFromPath('../../resources/heightmap_small.png', function(canvas) {
			var matrix = canvasUtils.getMatrixFromCanvas(canvas);
			var heightMapBoundingScript = new HeightMapBoundingScript(matrix);

			var meshData = Surface.createFromHeightMap(matrix);

			var material = Material.createMaterial(ShaderLib.simpleLit, '');
			material.wireframe = true;
			var surfaceEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material, '');
			surfaceEntity.transformComponent.setUpdated();
			surfaceEntity.addToWorld();

			addSpheres(goo, heightMapBoundingScript);

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
			scripts.scripts.push(heightMapBoundingScript);
			cameraEntity.setComponent(scripts);
		});
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		heightMapBoundingScriptDemo(goo);
	}

	init();
});

require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/geometrypack/Surface',
	'goo/shapes/Sphere',
	'goo/scriptpack/HeightMapBoundingScript',
	'goo/scripts/Scripts',
	'goo/util/CanvasUtils',
	'lib/V',
	'goo/scriptpack/ScriptRegister',
], function (
	Material,
	ShaderLib,
	Camera,
	CameraComponent,
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
	HeightMapBoundingScript,
	Scripts,
	CanvasUtils,
	V
	/* ScriptRegister */
) {
	'use strict';

	function addSpheres(goo, heightMapBoundingScript) {
		/*jshint loopfunc: true */
		var meshData = new Sphere(32, 32);

		var nSpheres = 10;
		var ak = Math.PI * 2 / nSpheres;
		for (var i = 0, k = 0; i < nSpheres; i++, k += ak) {
			var material = new Material(ShaderLib.simpleColored);
			material.uniforms.color = [
				Math.cos(k) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 2) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 4) * 0.5 + 0.5
			];
			var sphereEntity = goo.world.createEntity(meshData, material);
			sphereEntity.transformComponent.transform.translation.setd(i, 0, 0);

			var scripts = new ScriptComponent();
			(function(i) {
				scripts.scripts.push({
					run: function(entity) {
						var translation = entity.transformComponent.transform.translation;

						translation.data[0] = Math.cos(world.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;
						translation.data[2] = Math.sin(world.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;

						entity.transformComponent.setUpdated();
					}
				});
			})(i);
			scripts.scripts.push(heightMapBoundingScript);
			sphereEntity.setComponent(scripts);

			sphereEntity.addToWorld();
		}
	}


	var goo = V.initGoo();
	var world = goo.world;

	CanvasUtils.loadCanvasFromPath('../../../resources/heightmap_small.png', function(canvas) {
		var matrix = CanvasUtils.getMatrixFromCanvas(canvas);
		var heightMapBoundingScript = new HeightMapBoundingScript(matrix);

		var meshData = Surface.createFromHeightMap(matrix);

		var material = new Material(ShaderLib.simpleLit);
		material.wireframe = true;

		var surfaceEntity = world.createEntity(meshData, material);
		surfaceEntity.transformComponent.setUpdated();
		surfaceEntity.addToWorld();

		addSpheres(goo, heightMapBoundingScript);

		// Add camera
		var cameraEntity = world.createEntity(new Camera(), 'CameraEntity', [0, 10, 0]).lookAt(30, 0, 30).addToWorld();

		// Camera control set up
		var scriptComponent = new ScriptComponent([
			Scripts.create('WASD', {
				domElement : goo.renderer.domElement,
				walkSpeed : 25.0,
				crawlSpeed : 10.0
			}),
			Scripts.create('MouseLookScript', {
				domElement : goo.renderer.domElement
			})
		]);

		cameraEntity.set(scriptComponent);
	});
});

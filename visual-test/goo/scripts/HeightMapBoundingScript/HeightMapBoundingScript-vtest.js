
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
			var sphereEntity = gooRunner.world.createEntity(meshData, material);
			sphereEntity.transformComponent.transform.translation.setDirect(i, 0, 0);

			var scripts = new ScriptComponent();
			(function(i) {
				scripts.scripts.push({
					run: function(entity) {
						var translation = entity.transformComponent.transform.translation;

						translation.x = Math.cos(world.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;
						translation.z = Math.sin(world.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;

						entity.transformComponent.setUpdated();
					}
				});
			})(i);
			scripts.scripts.push(heightMapBoundingScript);
			sphereEntity.setComponent(scripts);

			sphereEntity.addToWorld();
		}
	}


	var gooRunner = V.initGoo();
	var world = gooRunner.world;

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
				domElement : gooRunner.renderer.domElement,
				walkSpeed : 25.0,
				crawlSpeed : 10.0
			}),
			Scripts.create('MouseLookScript', {
				domElement : gooRunner.renderer.domElement
			})
		]);

		cameraEntity.set(scriptComponent);
	});
});

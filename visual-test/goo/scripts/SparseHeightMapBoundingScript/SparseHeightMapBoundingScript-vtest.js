require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	'goo/geometrypack/Surface',
	'goo/scriptpack/SparseHeightMapBoundingScript',
	'goo/scripts/Scripts',
	'lib/V',
	'goo/scriptpack/ScriptRegister'
], function (
	Material,
	ShaderLib,
	Camera,
	Sphere,
	Box,
	ScriptComponent,
	Vector3,
	Surface,
	SparseHeightMapBoundingScript,
	Scripts,
	V
	/*ScriptRegister*/
	) {
	'use strict';

	function addSpheres(sparseHeightMapBoundingScript) {
		var meshData = new Sphere(32, 32);

		var nSpheres = 10;
		var ak = Math.PI * 2 / nSpheres;

		function makeScript(i) {
			return {
				run: function(entity) {
					var translation = entity.transformComponent.transform.translation;

					translation.data[0] = Math.cos(world.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;
					translation.data[2] = Math.sin(world.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;

					entity.transformComponent.setUpdated();
				}
			};
		}

		for (var i = 0, k = 0; i < nSpheres; i++, k += ak) {
			var material = new Material(ShaderLib.simpleColored);
			material.uniforms.color = [
				Math.cos(k) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 2) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 4) * 0.5 + 0.5
			];
			var sphereEntity = world.createEntity(meshData, material, [i, 0, 0]);

			var scriptComponent = new ScriptComponent([makeScript(i), sparseHeightMapBoundingScript]);
			sphereEntity.set(scriptComponent);

			sphereEntity.addToWorld();
		}
	}

	function addCube(x, y, z) {
		var cubeMeshData = new Box(1, 0.1, 1);
		var cubeMaterial = new Material(ShaderLib.textured);
		world.createEntity(cubeMeshData, cubeMaterial, [x, y, z]).addToWorld();
	}

	function getMatrix(sparseHeightMapBoundingScript, nSamples) {
		var mat = [];
		for (var i = 0; i < nSamples; i++) {
			mat.push([]);
			for (var j = 0; j < nSamples; j++) {
				var closest = sparseHeightMapBoundingScript.getClosest(j, i);
				mat[i].push(closest);
			}
		}
		return mat;
	}

	function randomTerrain(nPoints, maxX, maxZ) {
		var elevationData = [];
		for (var i = 0; i < nPoints; i++) {
			var x = V.rng.nextFloat() * maxX;
			var z = V.rng.nextFloat() * maxZ;
			var y = (Math.cos(x / 3) + Math.cos(z / 3)) * 4;

		    elevationData.push(x, y, z);

			addCube(x, y, z);
		}

		return elevationData;
	}

	var goo = V.initGoo();
	var world = goo.world;

	// add terrain
	var elevationData = randomTerrain(50, 100, 100);
	var sparseHeightMapBoundingScript = new SparseHeightMapBoundingScript(elevationData);

	var matrix = getMatrix(sparseHeightMapBoundingScript, 128);
	var meshData = Surface.createFromHeightMap(matrix);

	var material = new Material(ShaderLib.simpleLit);
	//material.wireframe = true;
	var surfaceEntity = world.createEntity(meshData, material);
	surfaceEntity.addToWorld();

	// add spheres
	addSpheres(sparseHeightMapBoundingScript);

	V.addLights();

	// Add camera
	var cameraEntity = world.createEntity(new Camera(), [0, 30, 0])
		.lookAt(40, 0, 40)
		.addToWorld();

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

	V.process();
});

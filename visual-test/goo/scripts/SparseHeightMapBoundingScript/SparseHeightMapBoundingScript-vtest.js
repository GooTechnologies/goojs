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
	'goo/shapes/Sphere',
	'geometrypack/Surface',
	'goo/scripts/WASDControlScript',
	'goo/scripts/MouseLookControlScript',
	'goo/scripts/SparseHeightMapBoundingScript'
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
	Sphere,
	Surface,
	WASDControlScript,
	MouseLookControlScript,
	SparseHeightMapBoundingScript
	) {
	'use strict';

	function addSpheres(goo, sparseHeightMapBoundingScript) {
		var meshData = new Sphere(32, 32);

		var nSpheres = 10;
		var ak = Math.PI * 2 / nSpheres;

		function makeScript(i) {
			return {
				run: function(entity) {
					var translation = entity.transformComponent.transform.translation;

					translation.data[0] = Math.cos(World.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;
					translation.data[2] = Math.sin(World.time * 0.07 * (i + 3)) * (i * 1.6 + 4) + 32;

					entity.transformComponent.setUpdated();
				}
			};
		}

		for (var i = 0, k = 0; i < nSpheres; i++, k += ak) {
			var material = Material.createMaterial(ShaderLib.simpleColored, '');
			material.uniforms.color = [
				Math.cos(k) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 2) * 0.5 + 0.5,
				Math.cos(k + Math.PI / 3 * 4) * 0.5 + 0.5
			];
			var sphereEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material);
			sphereEntity.transformComponent.transform.translation.setd(i, 0, 0);

			var scriptComponent = new ScriptComponent(makeScript(i));
			scriptComponent.scripts.push(sparseHeightMapBoundingScript);
			sphereEntity.setComponent(scriptComponent);

			sphereEntity.addToWorld();
		}
	}

	function addCube(goo, x, y, z) {
		var cubeMeshData = ShapeCreator.createBox(1, 0.1, 1);
		var cubeMaterial = Material.createMaterial(ShaderLib.textured, '');
		var cubeEntity = EntityUtils.createTypicalEntity(goo.world, cubeMeshData, cubeMaterial);
		cubeEntity.transformComponent.transform.translation.set(x, y, z);
		cubeEntity.addToWorld();
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

	function randomTerrain(goo, nPoints, maxX, maxZ) {
		var elevationData = [];
		for (var i = 0; i < nPoints; i++) {
			var x = Math.random() * maxX;
			var z = Math.random() * maxZ;
			var y = (Math.cos(x / 3) + Math.cos(z / 3)) * 4;

		    elevationData.push(x, y, z);

			addCube(goo, x, y, z);
		}

		return elevationData;
	}

	function sparseHeightMapBoundingScriptDemo(goo) {
		// add terrain
		var elevationData = randomTerrain(goo, 50, 100, 100);
		var sparseHeightMapBoundingScript = new SparseHeightMapBoundingScript(elevationData);

		var matrix = getMatrix(sparseHeightMapBoundingScript, 128);
		var meshData = Surface.createFromHeightMap(matrix);

		var material = Material.createMaterial(ShaderLib.simpleLit, '');
		//material.wireframe = true;
		var surfaceEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material, '');
		surfaceEntity.transformComponent.setUpdated();
		surfaceEntity.addToWorld();

		// add spheres
		addSpheres(goo, sparseHeightMapBoundingScript);

		// add light
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(0, 100, 0);
		lightEntity.addToWorld();

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 30, 0);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(40, 0, 40), Vector3.UNIT_Y);
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

		cameraEntity.setComponent(scripts);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		sparseHeightMapBoundingScriptDemo(goo);
	}

	init();
});

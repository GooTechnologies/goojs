require.config({
	paths: {
		"goo": "../../../../src/goo"
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
	'goo/renderer/bounds/BoundingBox',
	'goo/math/Vector3'
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
	BoundingBox,
	Vector3
	) {
	'use strict';

	function boundingBoxDemo(goo) {
		function showBoundingBox(shapeMeshData) {
			// shape and boundingBox material
			var material1 = Material.createMaterial(ShaderLib.simpleColored, '');
			material1.uniforms.color = [0.3, 0.6, 0.9];
			var material2 = Material.createMaterial(ShaderLib.simpleColored, '');
			material2.uniforms.color = [0.3, 0.9, 0.6];

			// wrap shapeMeshData in an entity
			var shapeEntity = EntityUtils.createTypicalEntity(goo.world, shapeMeshData);
			shapeEntity.meshRendererComponent.materials.push(material1);
			shapeEntity.addToWorld();

			// bounding box
			var boundingBox = new BoundingBox();
			boundingBox.computeFromPoints(shapeMeshData.dataViews.POSITION);
			var xSize = boundingBox.xExtent * 2;
			var ySize = boundingBox.yExtent * 2;
			var zSize = boundingBox.zExtent * 2;

			// dummy box the same size as the bounding box to get the normals from
			var dummyMeshData = ShapeCreator.createBox(xSize, ySize, zSize);

			// boundingBox normals used as indicators
			var normalsMeshData = dummyMeshData.getNormalsMeshData();
			var normalsEntity = EntityUtils.createTypicalEntity(goo.world, normalsMeshData);
			normalsEntity.meshRendererComponent.materials.push(material2);
			normalsEntity.addToWorld();

			// camera
			var camera = new Camera(45, 1, 1, 1000);
			var cameraEntity = goo.world.createEntity("CameraEntity");
			cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
			cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
			cameraEntity.setComponent(new CameraComponent(camera));
			cameraEntity.addToWorld();
			var scripts = new ScriptComponent();
			scripts.scripts.push(new OrbitCamControlScript({
				domElement : goo.renderer.domElement,
				spherical : new Vector3(5, Math.PI / 2, 0)
			}));
			cameraEntity.setComponent(scripts);
		}

		var shapeMeshData = ShapeCreator.createSphere();
		showBoundingBox(shapeMeshData);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		boundingBoxDemo(goo);
	}

	init();
});

require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/math/Vector3',
	'../../../lib/V'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	BoundingBox,
	Vector3,
	V
	) {
	'use strict';

	function boundingBoxDemo(goo) {
		var shapeMeshData = ShapeCreator.createSphere();

		// shape and boundingBox material
		var material1 = Material.createMaterial(ShaderLib.simpleColored, '');
		material1.uniforms.color = [0.3, 0.6, 0.9];
		var material2 = Material.createMaterial(ShaderLib.simpleColored, '');
		material2.uniforms.color = [0.3, 0.9, 0.6];
		material2.wireframe = true;

		// wrap shapeMeshData in an entity
		var shapeEntity = goo.world.createEntity(shapeMeshData, material1);
		shapeEntity.addToWorld();

		// bounding box
		var boundingBox = new BoundingBox();
		boundingBox.computeFromPoints(shapeMeshData.dataViews.POSITION);
		var xSize = boundingBox.xExtent * 2;
		var ySize = boundingBox.yExtent * 2;
		var zSize = boundingBox.zExtent * 2;
		var xCenter = boundingBox.center.data[0];
		var yCenter = boundingBox.center.data[1];
		var zCenter = boundingBox.center.data[2];

		var boxMeshData = ShapeCreator.createBox(xSize, ySize, zSize);
		var boxEntity = goo.world.createEntity(boxMeshData, material2);

		boxEntity.transformComponent.transform.translation.setd(xCenter, yCenter, zCenter);
		boxEntity.addToWorld();

		// camera
		V.addOrbitCamera(goo, new Vector3(5, Math.PI / 2, 0));
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		boundingBoxDemo(goo);
	}

	init();
});

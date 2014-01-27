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
	EntityUtils,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	BoundingBox,
	Vector3,
	V
	) {
	'use strict';

	function buildCustomTriangle(verts) {
		var indices = [];
		indices.push(0, 1, 2);

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 3, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = [3];
		meshData.indexModes = ['Triangles'];

		return meshData;
	}

	function boundingBoxDemo(goo) {
		var shape1MeshData = ShapeCreator.createSphere();
		var shape2MeshData = buildCustomTriangle([0, 0, 4, 0, 3, 5, 0, 0, 6]);

		// shapes and boundingBox material
		var material1 = Material.createMaterial(ShaderLib.simpleColored, '');
		material1.uniforms.color = [0.3, 0.6, 0.9];
		var material2 = Material.createMaterial(ShaderLib.simpleColored, '');
		material2.uniforms.color = [0.3, 0.9, 0.6];
		material2.wireframe = true;

		// wrap shapeMeshData-s entities entity
		var shape1Entity = EntityUtils.createTypicalEntity(goo.world, shape1MeshData);
		shape1Entity.meshRendererComponent.materials.push(material1);
		shape1Entity.addToWorld();
		var shape2Entity = EntityUtils.createTypicalEntity(goo.world, shape2MeshData);
		shape2Entity.meshRendererComponent.materials.push(material1);
		shape2Entity.addToWorld();

		// bounding box for shape 1
		var boundingBox1 = new BoundingBox();
		boundingBox1.computeFromPoints(shape1MeshData.dataViews.POSITION);

		// bounding box for shape 2
		var boundingBox2 = new BoundingBox();
		boundingBox2.computeFromPoints(shape2MeshData.dataViews.POSITION);

		// get mergedBoundingBox
		var mergedBoundingBox = boundingBox1.merge(boundingBox2);

		var xSize = mergedBoundingBox.xExtent * 2;
		var ySize = mergedBoundingBox.yExtent * 2;
		var zSize = mergedBoundingBox.zExtent * 2;
		var xCenter = mergedBoundingBox.center.data[0];
		var yCenter = mergedBoundingBox.center.data[1];
		var zCenter = mergedBoundingBox.center.data[2];

		var boxMeshData = ShapeCreator.createBox(xSize, ySize, zSize);
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, boxMeshData);
		boxEntity.meshRendererComponent.materials.push(material2);
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

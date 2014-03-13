require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/ShapeCreator',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Vector3',
	'../../../lib/V'
], function (
	Material,
	ShaderLib,
	ShapeCreator,
	MeshData,
	MeshRendererComponent,
	BoundingSphere,
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

	function boundingSphereDemo() {
		var goo = V.initGoo();

		var shapeMeshData = buildCustomTriangle([0, -1, 0, 1, 0, 0, 0, 1, 0]);

		// shape and boundingBox material
		var material1 = new Material(ShaderLib.simpleColored, '');
		material1.uniforms.color = [0.3, 0.6, 0.9];
		var material2 = new Material(ShaderLib.simpleColored, '');
		material2.uniforms.color = [0.3, 0.9, 0.6];
		material2.wireframe = true;

		// wrap shapeMeshData in an entity
		goo.world.createEntity(shapeMeshData, material1).addToWorld();

		// bounding sphere
		var boundingSphere = new BoundingSphere();
		boundingSphere.computeFromPoints(shapeMeshData.dataViews.POSITION);
		var radius = boundingSphere.radius;
		var xCenter = boundingSphere.center.data[0];
		var yCenter = boundingSphere.center.data[1];
		var zCenter = boundingSphere.center.data[2];

		var sphereMeshData = ShapeCreator.createSphere(10, 16, radius);
		goo.world.createEntity(sphereMeshData, material2, [xCenter, yCenter, zCenter]).addToWorld();

		// camera
		V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));
	}

	boundingSphereDemo();
});

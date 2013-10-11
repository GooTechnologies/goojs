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
	'goo/renderer/bounds/BoundingSphere',
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

	function boundingSphereDemo(goo) {
		var shapeMeshData = buildCustomTriangle([0, -1, 0, 1, 0, 0, 0, 1, 0]);

		// shape and boundingBox material
		var material1 = Material.createMaterial(ShaderLib.simpleColored, '');
		material1.uniforms.color = [0.3, 0.6, 0.9];
		var material2 = Material.createMaterial(ShaderLib.simpleColored, '');
		material2.uniforms.color = [0.3, 0.9, 0.6];
		material2.wireframe = true;

		// wrap shapeMeshData in an entity
		var shapeEntity = EntityUtils.createTypicalEntity(goo.world, shapeMeshData);
		shapeEntity.meshRendererComponent.materials.push(material1);
		shapeEntity.addToWorld();

		// bounding sphere
		var boundingSphere = new BoundingSphere();
		boundingSphere.computeFromPoints(shapeMeshData.dataViews.POSITION);
		var radius = boundingSphere.radius;
		var xCenter = boundingSphere.center.data[0];
		var yCenter = boundingSphere.center.data[1];
		var zCenter = boundingSphere.center.data[2];

		var sphereMeshData = ShapeCreator.createSphere(10, 16, radius);
		var sphereEntity = EntityUtils.createTypicalEntity(goo.world, sphereMeshData);
		sphereEntity.meshRendererComponent.materials.push(material2);
		sphereEntity.transformComponent.transform.translation.setd(xCenter, yCenter, zCenter);
		sphereEntity.addToWorld();

		// camera
		V.addOrbitCamera(goo, new Vector3(5, Math.PI / 2, 0));
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		boundingSphereDemo(goo);
	}

	init();
});

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
	'goo/math/Vector3',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Transform'
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
	BoundingSphere,
	Transform
	) {
	'use strict';

	function addBoundingSphereToWorld(goo, boundingSphere) {
		var material2 = Material.createMaterial(ShaderLib.simpleColored, '');
		material2.uniforms.color = [0.3, 0.9, 0.6];
		material2.wireframe = true;

		var radius = boundingSphere.radius;
		var xCenter = boundingSphere.center.data[0];
		var yCenter = boundingSphere.center.data[1];
		var zCenter = boundingSphere.center.data[2];

		var sphereMeshData = ShapeCreator.createSphere(16, 16, radius);
		var sphereEntity = EntityUtils.createTypicalEntity(goo.world, sphereMeshData);
		sphereEntity.meshRendererComponent.materials.push(material2);
		sphereEntity.transformComponent.transform.translation.setd(xCenter, yCenter, zCenter);
		sphereEntity.addToWorld();
	}

	function addBoundingBoxToWorld(goo, boundingBox) {
		var material2 = Material.createMaterial(ShaderLib.simpleColored, '');
		material2.uniforms.color = [0.3, 0.9, 0.6];
		material2.wireframe = true;

		var xSize = boundingBox.xExtent * 2;
		var ySize = boundingBox.yExtent * 2;
		var zSize = boundingBox.zExtent * 2;
		var xCenter = boundingBox.center.data[0];
		var yCenter = boundingBox.center.data[1];
		var zCenter = boundingBox.center.data[2];

		var boxMeshData = ShapeCreator.createBox(xSize, ySize, zSize);
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, boxMeshData);
		boxEntity.meshRendererComponent.materials.push(material2);
		boxEntity.transformComponent.transform.translation.setd(xCenter, yCenter, zCenter);
		boxEntity.addToWorld();
	}

	function boundingBoxDemo(goo) {
		var transform = new Transform();

		var shape1MeshData = ShapeCreator.createSphere();
		transform.translation.setd(2, 0, 0);
		transform.update();
		shape1MeshData.applyTransform(MeshData.POSITION, transform);
		var shape2MeshData = ShapeCreator.createQuad();
		transform.translation.setd(0, 2, 0);
		transform.update();
		shape1MeshData.applyTransform(MeshData.POSITION, transform);

		// shapes and boundingBox material
		var material1 = Material.createMaterial(ShaderLib.simpleColored, '');
		material1.uniforms.color = [0.3, 0.6, 0.9];

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

		// bounding sphere for shape 2
		var boundingSphere2 = new BoundingSphere();
		boundingSphere2.computeFromPoints(shape2MeshData.dataViews.POSITION);

		// get mergedBoundingBox
		var boundingBox1_1 = new BoundingBox();
		boundingBox1_1.computeFromPoints(shape1MeshData.dataViews.POSITION);
		var mergedBoundingBox = boundingBox1_1.merge(boundingSphere2);

		addBoundingBoxToWorld(goo, boundingBox1);
		addBoundingSphereToWorld(goo, boundingSphere2);
		addBoundingBoxToWorld(goo, mergedBoundingBox);

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

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		boundingBoxDemo(goo);
	}

	init();
});

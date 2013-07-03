define([
	'goo/renderer/MeshData',
	'goo/util/MeshBuilder',
	'goo/math/Transform',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/MathUtils',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight'
	],
	/* @lends */
	function (
		MeshData,
		MeshBuilder,
		Transform,
		ShapeCreator,
		MeshDataComponent,
		MeshRendererComponent,
		Material,
		ShaderLib,
		MathUtils,
		PointLight,
		DirectionalLight,
		SpotLight
	) {
	"use strict";

	function LightPointer() {
	}

	function buildCircle(radius, nSegments) {
		radius = radius || 1;
		nSegments = nSegments || 8;

		var verts = [];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for(var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k) * radius, Math.sin(k) * radius, 0);
			indices.push(i, i + 1);
		}
		indices[indices.length - 1] = 0;

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildBall(radius) {
		radius = radius || 1;

		var meshBuilder = new MeshBuilder();
		var nSegments = 128;
		var circle = buildCircle(radius, nSegments);
		var transform;

		transform = new Transform();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(0, Math.PI/2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(Math.PI/2, Math.PI/2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildUmbrella(nSegments) {
		nSegments = nSegments || 8;

		var verts = [0, 0, 0];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for(var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k), Math.sin(k), 1);
			indices.push(0, i + 1);
		}

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments + 1, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildCone(angle, length) {
		angle = angle || 45;
		length = length || 1;

		var meshBuilder = new MeshBuilder();

		var nSegments = 64;
		var nParallel = 2;
		var dxParallel = length / 2;
		var dyParallel = Math.sin(angle * MathUtils.DEG_TO_RAD) * dxParallel;

		for(var i = 1; i <= nParallel; i++) {
			var circle = buildCircle(dyParallel * i, nSegments);
			var transform = new Transform();
			transform.translation.set(0, 0, dxParallel * i);
			transform.update();
			meshBuilder.addMeshData(circle, transform);
		}

		var umbrella = buildUmbrella(4);
		var transform = new Transform();
		transform.scale.set(dyParallel * nParallel, dyParallel * nParallel, dxParallel * nParallel);
		transform.update();
		meshBuilder.addMeshData(umbrella, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildTube(nSegments) {
		nSegments = nSegments || 8;

		var verts = [];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for(var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k), Math.sin(k), 0);
			verts.push(Math.cos(k), Math.sin(k), 1);
			indices.push(i * 2, i * 2 + 1);
		}

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments * 2, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildColumn() {
		var meshBuilder = new MeshBuilder();

		var nSegments = 64;
		var nParallel = 2;
		var dxParallel = 10;
		var radius = 2;

		for(var i = 0; i < nParallel; i++) {
			var circle = buildCircle(radius, nSegments);
			var transform = new Transform();
			transform.translation.set(0, 0, dxParallel * i);
			transform.update();
			meshBuilder.addMeshData(circle, transform);
		}

		var tube = buildTube(4);
		var transform = new Transform();
		transform.scale.set(radius, radius, dxParallel * nParallel);
		transform.update();
		meshBuilder.addMeshData(tube, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildPointLightMeshData(light) {
		var meshBuilder = new MeshBuilder();
		var transform = new Transform();

		var ballMeshData = buildBall(light.range);
		var sphereMeshData = ShapeCreator.createSphere(8, 8, 0.1);
		meshBuilder.addMeshData(ballMeshData, transform);
		meshBuilder.addMeshData(sphereMeshData, transform);
		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildSpotLightMeshData(light) {
		var meshBuilder = new MeshBuilder();
		var transform = new Transform();

		var coneMeshData = buildCone(light.angle, light.range);
		var sphereMeshData = ShapeCreator.createSphere(8, 8, 0.1);
		meshBuilder.addMeshData(coneMeshData, transform);
		meshBuilder.addMeshData(sphereMeshData, transform);
		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildDirectionalLightMeshData() {
		var meshBuilder = new MeshBuilder();
		var transform = new Transform();
		transform.scale.setd(1, 1, -1);
		transform.update();

		var columnMeshData = buildColumn();
		var sphereMeshData = ShapeCreator.createSphere(8, 8, 0.1);
		meshBuilder.addMeshData(columnMeshData, transform);
		meshBuilder.addMeshData(sphereMeshData, transform);
		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	// a light source with a mesh is a lamp
	function getLampMeshData(light) {
		if(light instanceof PointLight) {
			return buildPointLightMeshData(light);
		}
		if(light instanceof DirectionalLight) {
			return buildDirectionalLightMeshData(light);
		}
		if(light instanceof SpotLight) {
			return buildSpotLightMeshData(light);
		}
	}

	/**
	 * Attaches a pointer mesh to the specifies light entity that represents the light's properties (color, position, direction and range)
	 * @param {Entity} light entity to attach the pointer mesh to
	 * @return {Entity} the light entity for chaining.
	 */
	LightPointer.attachPointer = function (lightEntity) {
		var light = lightEntity.getComponent('lightComponent').light;

		var lampMeshData = getLampMeshData(light);

		var meshDataComponent = new MeshDataComponent(lampMeshData);
		lightEntity.setComponent(meshDataComponent);

		var meshRendererComponent = new MeshRendererComponent();
		lightEntity.setComponent(meshRendererComponent);

		var material = Material.createMaterial(ShaderLib.simpleColored, '');
		material.uniforms.color = [
			light.color.data[0],
			light.color.data[1],
			light.color.data[2]
		];
		lightEntity.meshRendererComponent.materials.push(material);

		return lightEntity;
	};

	/**
	 * Removes any mesh attached to an entity with a light component
	 * @param {Entity} light entity to remove the mesh components from
	 * @return {Entity} the light entity for chaining.
	 */
	LightPointer.removeMesh = function (lightEntity) {
		lightEntity.clearComponent('meshDataComponent');
		lightEntity.clearComponent('meshRendererComponent');

		return lightEntity;
	};

	return LightPointer;
});
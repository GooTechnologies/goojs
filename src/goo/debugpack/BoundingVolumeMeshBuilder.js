var BoundingBox = require('../renderer/bounds/BoundingBox');
var BoundingSphere = require('../renderer/bounds/BoundingSphere');
var MeshBuilder = require('../util/MeshBuilder');
var MeshData = require('../renderer/MeshData');
var Transform = require('../math/Transform');



	/**
	 * Provides methods for building bounding volume debug meshes
	 */
	function BoundingVolumeMeshBuilder() {}

	function buildBox(dx, dy, dz) {
		var verts = [
			 dx,  dy,  dz,
			 dx,  dy, -dz,
			 dx, -dy,  dz,
			 dx, -dy, -dz,
			-dx,  dy,  dz,
			-dx,  dy, -dz,
			-dx, -dy,  dz,
			-dx, -dy, -dz
		];

		var indices = [
			0, 1,
			0, 2,
			1, 3,
			2, 3,

			4, 5,
			4, 6,
			5, 7,
			6, 7,

			0, 4,
			1, 5,
			2, 6,
			3, 7
		];

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length / 3, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	BoundingVolumeMeshBuilder.buildBox = function (boundingBox) {
		var boxMeshData = buildBox(boundingBox.xExtent, boundingBox.yExtent, boundingBox.zExtent);
		// translate vertices to center
		return boxMeshData;
	};

	function buildCircle(radius, nSegments) {
		radius = radius || 1;
		nSegments = nSegments || 8;

		var verts = [];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
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

	function buildSphere(radius) {
		radius = radius || 1;

		var meshBuilder = new MeshBuilder();
		var nSegments = 128;
		var circle = buildCircle(radius, nSegments);
		var transform;

		transform = new Transform();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(0, Math.PI / 2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(Math.PI / 2, Math.PI / 2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	BoundingVolumeMeshBuilder.buildSphere = function (boundingSphere) {
		var sphereMeshData = buildSphere(boundingSphere.radius);
		// translate vertices to center
		return sphereMeshData;
	};

	BoundingVolumeMeshBuilder.build = function (boundingVolume) {
		if (boundingVolume instanceof BoundingBox) {
			return BoundingVolumeMeshBuilder.buildBox(boundingVolume);
		} else if (boundingVolume instanceof BoundingSphere) {
			return BoundingVolumeMeshBuilder.buildSphere(boundingVolume);
		}
	};

	module.exports = BoundingVolumeMeshBuilder;

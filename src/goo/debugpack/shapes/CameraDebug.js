var MeshData = require('../../renderer/MeshData');
var MeshBuilder = require('../../util/MeshBuilder');
var Transform = require('../../math/Transform');
var Vector3 = require('../../math/Vector3');
var Box = require('../../shapes/Box');
var Cylinder = require('../../shapes/Cylinder');



	function CameraDebug() {
		this._camera = CameraDebug.buildCamera();
	}

	CameraDebug.prototype.getMesh = function (camera, options) {
		return options.full ? [this._camera, CameraDebug.buildFrustum(camera)] : [this._camera];
	};

	CameraDebug.buildFrustum = function (camera) {
		var near = camera.near;
		var far = camera.far;
		var aspect = camera.aspect;
		var tanFar, tanNear;

		if (camera.projectionMode === 0) {
			var tan = Math.tan(camera.fov / 2 * Math.PI / 180);
			tanFar = tan * far;
			tanNear = tan * near;
		} else {
			var size = camera.size || 100;
			tanFar = size;
			tanNear = size;
		}

		var f0, f1, f2, f3;
		f0 = {
			x: -tanFar * aspect,
			y: tanFar,
			z: -far
		};

		f1 = {
			x: -tanFar * aspect,
			y: -tanFar,
			z: -far
		};

		f2 = {
			x: tanFar * aspect,
			y: -tanFar,
			z: -far
		};

		f3 = {
			x: tanFar * aspect,
			y: tanFar,
			z: -far
		};

		var n0, n1, n2, n3;
		n0 = {
			x: -tanNear * aspect,
			y: tanNear,
			z: -near
		};

		n1 = {
			x: -tanNear * aspect,
			y: -tanNear,
			z: -near
		};

		n2 = {
			x: tanNear * aspect,
			y: -tanNear,
			z: -near
		};

		n3 = {
			x: tanNear * aspect,
			y: tanNear,
			z: -near
		};

		var verts = [];
		verts.push(f0.x, f0.y, f0.z);
		verts.push(f1.x, f1.y, f1.z);
		verts.push(f2.x, f2.y, f2.z);
		verts.push(f3.x, f3.y, f3.z);

		verts.push(n0.x, n0.y, n0.z);
		verts.push(n1.x, n1.y, n1.z);
		verts.push(n2.x, n2.y, n2.z);
		verts.push(n3.x, n3.y, n3.z);

		var indices = [];
		indices.push(0, 1);
		indices.push(1, 2);
		indices.push(2, 3);
		indices.push(3, 0);

		indices.push(4, 5);
		indices.push(5, 6);
		indices.push(6, 7);
		indices.push(7, 4);

		indices.push(0, 4);
		indices.push(1, 5);
		indices.push(2, 6);
		indices.push(3, 7);

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 8, 24);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	};

	CameraDebug.buildCamera = function () {
		var meshBuilder = new MeshBuilder();
		var transform = new Transform();

		var cameraBox1 = new Cylinder(32, 0.6);
		var cameraBox2 = new Cylinder(32, 0.6);
		var cameraBox3 = new Box(0.3, 1, 1.6);

		var cameraBox4 = new Box(0.2, 0.15, 0.7);
		cameraBox4.applyFunction(MeshData.POSITION, function (vert) {
			return new Vector3(
				vert.x + vert.x / ((vert.z + 1.1) * 0.3),
				vert.y + vert.y / ((vert.z + 1.1) * 0.3),
				vert.z
			);
		});

		transform.translation.setDirect(0.0, 0.0, 0.0);
		transform.update();
		meshBuilder.addMeshData(cameraBox4, transform);

		transform.translation.setDirect(0.0, 0.0, 1.3);
		transform.update();
		meshBuilder.addMeshData(cameraBox3, transform);

		transform.scale.setDirect(1.0, 1.0, 0.5);
		transform.setRotationXYZ(0.0, Math.PI / 2, 0.0);

		transform.translation.setDirect(0.0, 1.2, 0.6);
		transform.update();
		meshBuilder.addMeshData(cameraBox1, transform);

		transform.translation.setDirect(0.0, 1.2, 2.0);
		transform.update();
		meshBuilder.addMeshData(cameraBox2, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	};

	module.exports = CameraDebug;
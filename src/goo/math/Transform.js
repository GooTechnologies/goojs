define([
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/Matrix4x4'
],
/** @lends */
function (
	Vector3,
	Matrix3x3,
	Matrix4x4
) {
	"use strict";

	/**
	 * @class Transform models a transformation in 3d space as: Y = M*X+T, with M being a Matrix3 and T is a Vector3. Generally M will be a rotation
	 *        only matrix in which case it is represented by the matrix and scale fields as R*S, where S is a positive scale vector. For non-uniform
	 *        scales and reflections, use setMatrix, which will consider M as being a general 3x3 matrix and disregard anything set in scale.
	 */
	function Transform() {
		this.matrix = new Matrix4x4();

		this.translation = new Vector3();
		this.rotation = new Matrix3x3();
		this.scale = new Vector3(1, 1, 1);

		this.tmpVec = new Vector3();
		this.tmpMat1 = new Matrix3x3();
		this.tmpMat2 = new Matrix3x3();
	}

	// TODO: sort this crap out!
	Transform.prototype.multiply = function (a, b) {
		Matrix4x4.combine(a.matrix, b.matrix, this.matrix);

		this.tmpMat1.data.set(a.rotation.data);
		this.tmpMat1.multiplyDiagonalPost(a.scale, this.tmpMat1);
		this.tmpMat2.data.set(b.rotation.data);
		this.tmpMat2.multiplyDiagonalPost(b.scale, this.tmpMat2);
		Matrix3x3.combine(this.tmpMat1, this.tmpMat2, this.rotation);
		this.translation.setv(b.translation);
		this.tmpMat1.applyPost(this.translation).addv(a.translation);
		this.scale.setv(a.scale).mulv(b.scale);
	};

	Transform.prototype.setIdentity = function () {
		this.matrix.setIdentity();

		this.translation.setv(Vector3.ZERO);
		this.rotation.setIdentity();
		this.scale.setv(Vector3.ONE);
	};

	Transform.prototype.applyForward = function (point, store) {
		store.setv(point);

		// store.set(store.x * this.scale.x, store.y * this.scale.y, store.z * this.scale.z);
		// this.rotation.applyPost(store);
		// store.add(this.translation);

		this.matrix.applyPostPoint(store);

		return store;
	};

	Transform.prototype.applyForwardVector = function (vector, store) {
		store.copy(vector);

		store.set(store.x * this.scale.x, store.y * this.scale.y, store.z * this.scale.z);
		this.rotation.applyPost(store);

		return store;
	};

	Transform.prototype.update = function () {
		var target = this.matrix.data;
		var rotation = this.rotation.data;
		var scale = this.scale.data;
		var translation = this.translation.data;

		target[0] = scale[0] * rotation[0];
		target[1] = scale[0] * rotation[1];
		target[2] = scale[0] * rotation[2];
		target[3] = 0.0;
		target[4] = scale[1] * rotation[3];
		target[5] = scale[1] * rotation[4];
		target[6] = scale[1] * rotation[5];
		target[7] = 0.0;
		target[8] = scale[2] * rotation[6];
		target[9] = scale[2] * rotation[7];
		target[10] = scale[2] * rotation[8];
		target[11] = 0.0;
		target[12] = translation[0];
		target[13] = translation[1];
		target[14] = translation[2];
		target[15] = 1.0;
	};

	Transform.prototype.copy = function (transform) {
		this.matrix.copy(transform.matrix);

		this.translation.setv(transform.translation);
		this.rotation.copy(transform.rotation);
		this.scale.setv(transform.scale);
	};

	/**
	 * Set this transform's rotation to rotation around X, Y and Z axis.
	 * The rotation is applied in XYZ order.
	 */
	Transform.prototype.setRotationXYZ = function (x, y, z) {
		this.rotation.fromAngles(x, y, z);
	};

	/**
	 * @description Sets the transform to look in a specific direction.
	 * @param {Vector3} position Target position.
	 * @param {Vector3} up Up vector.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Transform.prototype.lookAt = function (position, up) {
		this.tmpVec.copy(this.translation).sub(position).normalize();
		this.rotation.lookAt(this.tmpVec, up);
	};

	Transform.prototype.invert = function (store) {
		var result = store;
		if (!result) {
			result = new Transform();
		}

		// if (_identity) {
		// result.setIdentity();
		// return result;
		// }

		result.matrix.copy(this.matrix);
		result.matrix.invert();

		var newRotation = result.rotation.copy(this.rotation);
		// if (_uniformScale) {
		// var sx = this.scale.x;
		// newRotation.transposeLocal();
		// if (sx !== 1.0) {
		// newRotation.multiplyLocal(1.0 / sx);
		// }
		// } else {
		newRotation.multiplyDiagonalPost(this.scale, newRotation).invert();
		// }

		result.translation.copy(this.translation);
		result.rotation.applyPost(result.translation).invert();

		// result.update();

		return result;
	};

	Transform.prototype.toString = function () {
		return '' + this.matrix;
	};

	return Transform;
});
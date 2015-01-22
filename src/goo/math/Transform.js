define([
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/Matrix4x4',
	'goo/math/MathUtils'
], function (
	Vector3,
	Matrix3x3,
	Matrix4x4,
	MathUtils
) {
	'use strict';

	/**
	 * Transform models a transformation in 3d space as: Y = M*X+T, with M being a Matrix3 and T is a Vector3. Generally M will be a rotation
	 *        only matrix in which case it is represented by the matrix and scale fields as R*S, where S is a positive scale vector. For non-uniform
	 *        scales and reflections, use setMatrix, which will consider M as being a general 3x3 matrix and disregard anything set in scale.
	 */
	function Transform() {
		/** Read only, will be updated automatically by {@link Transform.update}
		 * @type {Matrix4x4}
		 */
		this.matrix = new Matrix4x4();
		this.normalMatrix = new Matrix3x3();

		/** @type {Vector3} */
		this.translation = new Vector3();
		/** @type {Matrix3x3} */
		this.rotation = new Matrix3x3();
		/** @type {Vector3} */
		this.scale = new Vector3(1, 1, 1);

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	var tmpVec = new Vector3();
	var tmpVec2 = new Vector3();
	var tmpMat1 = new Matrix3x3();

	/**
	 * Combines two transforms into one. This will only work if scaling in the left hand transform is uniform
	 * @param {Transform} lhs left hand side transform
	 * @param {Transform} rhs right hand side transform
	 * @param {Transform} target
	 * @returns {Transform} target
	 */
	Transform.combine = function (lhs, rhs, target) {
		target = target || new Transform();

		// Translation
		tmpVec.setVector(rhs.translation);
		// Rotate translation
		lhs.rotation.applyPost(tmpVec);
		// Scale translation
		tmpVec.mulVector(lhs.scale);
		// Translate translation
		tmpVec.addVector(lhs.translation);

		// Scale
		tmpVec2.setVector(rhs.scale);
		// Scale scale
		tmpVec2.mulVector(lhs.scale);

		// Rotation
		// Rotate rotation
		Matrix3x3.combine(lhs.rotation, rhs.rotation, tmpMat1);

		target.rotation.copy(tmpMat1);
		target.scale.setVector(tmpVec2);
		target.translation.setVector(tmpVec);

		target.update();

		return target;
	};

	/**
	 * Combines new transform into this one. This will only work if scaling in the left hand transform is uniform
	 * @param {Transform} rhs right hand side transform
	 * @returns {Transform} this for chaining
	 */
	Transform.prototype.combine = function (rhs) {
		return Transform.combine(this, rhs, this);
	};

	// TODO: sort this crap out!
	Transform.prototype.multiply = function (a, b) {
		Matrix4x4.combine(a.matrix, b.matrix, this.matrix);

		tmpMat1.data.set(a.rotation.data);
		//tmpMat1.multiplyDiagonalPost(a.scale, tmpMat1);
		this.rotation.data.set(b.rotation.data);
		//this.rotation.multiplyDiagonalPost(b.scale, this.rotation);
		Matrix3x3.combine(tmpMat1, this.rotation, this.rotation);
		this.translation.setVector(b.translation);
		this.translation.mulVector(a.scale);
		tmpMat1.applyPost(this.translation).addVector(a.translation);

		tmpVec.setVector(a.scale).mulVector(b.scale);
		this.scale.setVector(tmpVec);
	};

	/**
	 * Set Transform to identity
	 */
	Transform.prototype.setIdentity = function () {
		this.matrix.setIdentity();

		this.translation.setVector(Vector3.ZERO);
		this.rotation.setIdentity();
		this.scale.setVector(Vector3.ONE);
	};

	/**
	 * Applies this transform to supplied vector as a point
	 * @param {Vector3} point
	 * @param {Vector3} store
	 * @returns {Vector3} store
	 * @example
	 * // Vector3 object, one unit right, two units up, two units back
	 * var v1 = new Vector3(1, 2, 2);
	 * // Vector3 to store the local position
	 * var localPos = new Vector3();
	 * // converts v1 to be in 'world space' based on the entities postion / rotation
	 * entity.transformComponent.transform.applyForward(v1, localPos);
	 */
	Transform.prototype.applyForward = function (point, store) {
		store.setVector(point);

		// store.set(store.x * this.scale.x, store.y * this.scale.y, store.z * this.scale.z);
		// this.rotation.applyPost(store);
		// store.add(this.translation);

		this.matrix.applyPostPoint(store);

		return store;
	};

	/**
	 * Applies this transform to supplied vector as a direction-vector (translation will not affect it)
	 * @param {Vector3} vector
	 * @param {Vector3} store
	 * @returns {Vector3} store
	 * @example
	 * // Vector3 pointing in the direction we want
	 * var back = new Vector3(0, 0, 1);
	 * // Vector3 to store the local 'back'
	 * var localBack = new Vector3();
	 * // converts 'back' to a localized direction based on the entities rotation
	 * entity.transformComponent.transform.applyForwardVector(back, localBack);
	 */
	Transform.prototype.applyForwardVector = function (vector, store) {
		store.copy(vector);

		store.setDirect(store.x * this.scale.x, store.y * this.scale.y, store.z * this.scale.z);
		this.rotation.applyPost(store);

		return store;
	};

	/**
	 * Updates the transform according to set scaling, rotation and translation. This is done automatically by the engine
	 */
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

	/**
	 * Updates the normal matrix. This is done automatically by the engine.
	 */
	Transform.prototype.updateNormalMatrix = function () {
		// Copy upper left of 4x4 to 3x3
		var t = this.normalMatrix.data;
		var s = this.matrix.data;
		t[0] = s[0];
		t[1] = s[1];
		t[2] = s[2];
		t[3] = s[4];
		t[4] = s[5];
		t[5] = s[6];
		t[6] = s[8];
		t[7] = s[9];
		t[8] = s[10];

		// invert + transpose if non-uniform scaling
		// RH: Should we check against epsilon here?
		var scale = this.scale.data;
		if (scale[0] !== scale[1] || scale[0] !== scale[2]) {
			Matrix3x3.invert(this.normalMatrix, tmpMat1);
			Matrix3x3.transpose(tmpMat1, this.normalMatrix);
		}
	};

	/**
	 * Copy supplied transform into this transform
	 * @param {Transform} transform
	 */
	Transform.prototype.copy = function (transform) {
		this.matrix.copy(transform.matrix);

		this.translation.setVector(transform.translation);
		this.rotation.copy(transform.rotation);
		this.scale.setVector(transform.scale);
	};

	/**
	 * Set this transform's rotation to rotation around X, Y and Z axis.
	 * The rotation is applied in XYZ order.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	Transform.prototype.setRotationXYZ = function (x, y, z) {
		this.rotation.fromAngles(x, y, z);
	};

	/**
	 * Sets the transform to look in a specific direction.
	 * @param {Vector3} position Target position.
	 * @param {Vector3} [up=(0, 1, 0)] Up vector.
	 */
	Transform.prototype.lookAt = function (position, up) {
		if (!up) {
			up = Vector3.UNIT_Y;
		}

		tmpVec.setVector(position).subVector(this.translation);
		if (tmpVec.lengthSquared() > MathUtils.EPSILON) { // should be epsilon^2 but it hopefully doesn't matter
			tmpVec.normalize();
			this.rotation.lookAt(tmpVec, up);
		}
	};

	/**
	 * Invert this transform and store it in supplied transform
	 * @param {Transform} store
	 * @returns {Transform} store
	 */
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
		newRotation.transpose();
		// if (_uniformScale) {
		// var sx = this.scale.x;
		// newRotation.transposeLocal();
		// if (sx !== 1.0) {
		// newRotation.multiplyLocal(1.0 / sx);
		// }
		// } else {
		//newRotation.multiplyDiagonalPost(this.scale, newRotation).invert();
		// }

		result.scale.setVector(Vector3.ONE).div(this.scale);
		result.translation.copy(this.translation).invert().mulVector(result.scale);
		result.rotation.applyPost(result.translation);

		// result.update();

		return result;
	};

	//! AT: the second toString in the whole engine
	Transform.prototype.toString = function () {
		return '' + this.matrix;
	};

	return Transform;
});
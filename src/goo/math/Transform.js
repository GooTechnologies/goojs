define(['goo/math/Vector3', 'goo/math/Matrix3x3', 'goo/math/Matrix4x4', 'goo/util/Handy'], function (Vector3, Matrix3x3, Matrix4x4, Handy) {
	"use strict";

	/**
	 * @name Transform
	 * @class Transform models a transformation in 3d space as: Y = M*X+T, with M being a Matrix3 and T is a Vector3. Generally M will be a rotation
	 *        only matrix in which case it is represented by the matrix and scale fields as R*S, where S is a positive scale vector. For non-uniform
	 *        scales and reflections, use setMatrix, which will consider M as being a general 3x3 matrix and disregard anything set in scale.
	 */
	function Transform() {
		this.matrix = new Matrix4x4();

		this.translation = new Vector3();
		this.rotation = new Matrix3x3();
		this.scale = new Vector3(1, 1, 1);

		this.eulerUpdated = false;
		var that = this;

		// TODO: find a better solution
		Handy.addListener(this, 'rotation', undefined, function () {
			that.rotation.x = 0;
			that.rotation.y = 0;
			that.rotation.z = 0;
			Handy.addListener(that.rotation, 'x', undefined, function () {
				that.eulerUpdated = true;
			});
			Handy.addListener(that.rotation, 'y', undefined, function () {
				that.eulerUpdated = true;
			});
			Handy.addListener(that.rotation, 'z', undefined, function () {
				that.eulerUpdated = true;
			});
		});

		this.rotation.x = 0;
		this.rotation.y = 0;
		this.rotation.z = 0;
		Handy.addListener(this.rotation, 'x', undefined, function () {
			that.eulerUpdated = true;
		});
		Handy.addListener(this.rotation, 'y', undefined, function () {
			that.eulerUpdated = true;
		});
		Handy.addListener(this.rotation, 'z', undefined, function () {
			that.eulerUpdated = true;
		});
	}

	// TODO: sort this crap out!
	Transform.prototype.multiply = function (a, b) {
		Matrix4x4.combine(a.matrix, b.matrix, this.matrix);

		// this.translation.copy(a.translation).add(b.translation);

		// Matrix3x3.combine(a.rotation, b.rotation, this.rotation);
		var m1 = new Matrix3x3();
		var m2 = new Matrix3x3();
		m1.copy(a.rotation).multiplyDiagonalPost(a.scale, m1);
		m2.copy(b.rotation).multiplyDiagonalPost(b.scale, m2);
		Matrix3x3.combine(m1, m2, this.rotation);

		this.translation.copy(b.translation);
		m1.applyPost(this.translation).add(a.translation);

		this.scale.copy(a.scale).mul(b.scale);
		// this.scale.copy(Vector3.ONE);
	};

	Transform.prototype.setIdentity = function () {
		this.matrix.setIdentity();

		this.translation.copy(Vector3.ZERO);
		this.rotation.setIdentity();
		this.scale.copy(Vector3.ONE);
	};

	Transform.prototype.applyForward = function (point, store) {
		store.copy(point);

		// store.set(store.x * this.scale.x, store.y * this.scale.y, store.z * this.scale.z);
		// this.rotation.applyPost(store);
		// store.add(this.translation);

		this.matrix.applyPostPoint(store);

		return store;
	};

	Transform.prototype.update = function () {
		if (this.eulerUpdated) {
			// console.log(this.rotation.x, this.rotation.y, this.rotation.z);
			this.rotation.fromAngles(this.rotation.x, this.rotation.y, this.rotation.z);
			this.eulerUpdated = false;
		}

		var rd = this.matrix;
		var d = this.rotation;

		rd.e00 = this.scale.x * d.e00;
		rd.e01 = this.scale.x * d.e01;
		rd.e02 = this.scale.x * d.e02;
		rd.e10 = this.scale.y * d.e10;
		rd.e11 = this.scale.y * d.e11;
		rd.e12 = this.scale.y * d.e12;
		rd.e20 = this.scale.z * d.e20;
		rd.e21 = this.scale.z * d.e21;
		rd.e22 = this.scale.z * d.e22;

		rd.e30 = 0.0;
		rd.e31 = 0.0;
		rd.e32 = 0.0;

		rd.e03 = this.translation.x;
		rd.e13 = this.translation.y;
		rd.e23 = this.translation.z;
		rd.e33 = 1.0;
	};

	Transform.prototype.copy = function (transform) {
		this.matrix.copy(transform.matrix);

		this.translation.copy(transform.translation);
		this.rotation.copy(transform.rotation);
		// this.rotation.x = transform.rotation.x;
		// this.rotation.y = transform.rotation.y;
		// this.rotation.z = transform.rotation.z;
		this.scale.copy(transform.scale);
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
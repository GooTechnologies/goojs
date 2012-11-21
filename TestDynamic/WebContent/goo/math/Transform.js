define(['goo/math/Vector3', 'goo/math/Matrix3x3', 'goo/math/Matrix4x4', 'goo/util/Handy'], function(Vector3, Matrix3x3, Matrix4x4, Handy) {
	"use strict";

	function Transform() {
		this.matrix = new Matrix4x4();

		this.translation = new Vector3();
		this.rotation = new Matrix3x3();
		this.scale = new Vector3(1, 1, 1);

		this.eulerUpdated = false;
		var that = this;

		// TODO: find a better solution
		Handy.addListener(this, 'rotation', undefined, function() {
			that.rotation.x = 0;
			that.rotation.y = 0;
			that.rotation.z = 0;
			Handy.addListener(that.rotation, 'x', undefined, function() {
				that.eulerUpdated = true;
			});
			Handy.addListener(that.rotation, 'y', undefined, function() {
				that.eulerUpdated = true;
			});
			Handy.addListener(that.rotation, 'z', undefined, function() {
				that.eulerUpdated = true;
			});
		});

		this.rotation.x = 0;
		this.rotation.y = 0;
		this.rotation.z = 0;
		Handy.addListener(this.rotation, 'x', undefined, function() {
			that.eulerUpdated = true;
		});
		Handy.addListener(this.rotation, 'y', undefined, function() {
			that.eulerUpdated = true;
		});
		Handy.addListener(this.rotation, 'z', undefined, function() {
			that.eulerUpdated = true;
		});
	}

	Transform.prototype.multiply = function(a, b) {
		Matrix4x4.combine(a.matrix, b.matrix, this.matrix);
	};

	Transform.prototype.applyForward = function(point, store) {
		store.copy(point);

		store.set(store.x * this.scale.x, store.y * this.scale.y, store.z * this.scale.z);
		this.rotation.applyPost(store);
		store.add(this.translation);

		return store;
	};

	Transform.prototype.update = function() {
		if (this.eulerUpdated) {
			// console.log(this.rotation.x, this.rotation.y, this.rotation.z);
			this.rotation.fromAngles(this.rotation.x, this.rotation.y, this.rotation.z);
			this.eulerUpdated = false;
		}

		var rd = this.matrix.data;
		var d = this.rotation.data;

		rd[0] = this.scale.x * d[0];
		rd[1] = this.scale.x * d[3];
		rd[2] = this.scale.x * d[6];
		rd[4] = this.scale.y * d[1];
		rd[5] = this.scale.y * d[4];
		rd[6] = this.scale.y * d[7];
		rd[8] = this.scale.z * d[2];
		rd[9] = this.scale.z * d[5];
		rd[10] = this.scale.z * d[8];

		rd[12] = this.translation.x;
		rd[13] = this.translation.y;
		rd[14] = this.translation.z;
		rd[15] = 1.0;
	};

	Transform.prototype.copy = function(transform) {
		this.matrix.copy(transform.matrix);

		// this.translation.copy(transform.translation);
		// this.rotation.copy(transform.rotation);
		// this.rotation.x = transform.rotation.x;
		// this.rotation.y = transform.rotation.y;
		// this.rotation.z = transform.rotation.z;
		// this.scale.copy(transform.scale);
	};

	Transform.prototype.invert = function(store) {
		var result = store;
		if (!result) {
			result = new Transform();
		}

		// if (_identity) {
		// result.setIdentity();
		// return result;
		// }

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
		// result.updateFlags(_rotationMatrix);

		return result;
	};

	return Transform;
});
define(['goo/math/Vector3', 'goo/math/Matrix3x3', 'goo/math/Matrix4x4'], function(Vector3, Matrix3x3, Matrix4x4) {
	"use strict";

	function Transform() {
		this.matrix = new Matrix4x4();

		this.translation = new Vector3();
		this.rotation = new Matrix3x3();
		this.scale = new Vector3(1, 1, 1);

		// this._identity = true;
		// this._rotationMatrix = true;
		// this._uniformScale = true;
	}

	Transform.prototype.multiply = function(a, b) {
		this.matrix.mul(a.matrix, b.matrix);
	};

	Transform.prototype.applyForward = function(point, store) {
		store.copy(point);

		store.set(store.x * this.scale.x, store.y * this.scale.y, store.z * this.scale.z);
		this.rotation.applyPost(store);
		store.add(this.translation);

		return store;
	};

	Transform.prototype.update = function() {
		var rd = this.matrix.data;
		var d = this.rotation.data;

		rd[0] = this.scale.x * d[0];
		rd[1] = this.scale.x * d[1];
		rd[2] = this.scale.x * d[2];
		rd[4] = this.scale.y * d[3];
		rd[5] = this.scale.y * d[4];
		rd[6] = this.scale.y * d[5];
		rd[8] = this.scale.z * d[6];
		rd[9] = this.scale.z * d[7];
		rd[10] = this.scale.z * d[8];

		rd[3] = this.translation.x;
		rd[7] = this.translation.y;
		rd[11] = this.translation.z;
		rd[15] = 1.0;
	};

	Transform.prototype.copy = function(transform) {
		this.matrix.copy(transform.matrix);

		this.translation.copy(transform.translation);
		this.rotation.copy(transform.rotation);
		this.scale.copy(transform.scale);
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
define(function() {
	"use strict";

	function Transform() {
		this.matrix = new THREE.Matrix4();

		this.translation = new THREE.Vector3();
		this.rotation = new THREE.Vector3();
		this.rotationMatrix = new THREE.Matrix3();
		this.scale = new THREE.Vector3(1, 1, 1);

		this.useQuaternion = false;
		this.eulerOrder = 'XYZ';
	}

	Transform.prototype.multiply = function(a, b) {
		this.matrix.multiply(a.matrix, b.matrix);
	};

	Transform.prototype.applyForward = function(point, store) {
		store.copy(point);
		this.matrix.rotate(store);
		var me = this.matrix.elements;
		store.addSelf(new THREE.Vector3(me[12], me[13], me[14]));
		// this.rotationMatrix.setRotationFromEuler(this.rotation, 'XYZ');
		// this.rotationMatrix.rotateAxis(store);
		// store.addSelf(this.translation);
		return store;
	};

	Transform.prototype.update = function() {
		this.matrix.setPosition(this.translation);

		if (!this.useQuaternion) {
			this.matrix.setRotationFromEuler(this.rotation, this.eulerOrder);
		} else {
			this.matrix.setRotationFromQuaternion(this.quaternion);
		}

		// if (this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1) {
		this.matrix.scale(this.scale);
		// }
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

		var newMatrix = result._matrix.set(_matrix);
		if (_rotationMatrix) {
			if (_uniformScale) {
				var sx = _scale.getX();
				newMatrix.transposeLocal();
				if (sx !== 1.0) {
					newMatrix.multiplyLocal(1.0 / sx);
				}
			} else {
				newMatrix.multiplyDiagonalPost(_scale, newMatrix).invertLocal();
			}
		} else {
			newMatrix.invertLocal();
		}

		result._matrix.applyPost(_translation, result._translation).negateLocal();
		result.updateFlags(_rotationMatrix);

		return result;
	};

	return Transform;
});
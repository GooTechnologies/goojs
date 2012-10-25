"use strict";

define(function() {
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

		// REVIEW: "if (!this.useQuaternion)"
		if (this.useQuaternion === false) {
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

	return Transform;
});
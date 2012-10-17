define(function() {
	function Transform() {
		this.matrix = new THREE.Matrix4();

		this.translation = new THREE.Vector3();
		this.rotation = new THREE.Vector3();
		this.scale = new THREE.Vector3(1, 1, 1);

		this.useQuaternion = false;
		this.eulerOrder = 'XYZ';
	}

	Transform.prototype.update = function() {
		this.matrix.setPosition(this.translation);

		if (this.useQuaternion === false) {
			this.matrix.setRotationFromEuler(this.rotation, this.eulerOrder);
		} else {
			this.matrix.setRotationFromQuaternion(this.quaternion);
		}

		if (this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1) {
			this.matrix.scale(this.scale);
			// this.boundRadiusScale = Math.max( this.scale.x, Math.max(
			// this.scale.y, this.scale.z ) );
		}
	};

	Transform.prototype.copy = function(transform) {
		this.matrix.copy(transform.matrix);

		this.translation.copy(transform.translation);
		this.rotation.copy(transform.rotation);
		this.scale.copy(transform.scale);
	};

	return Transform;
});
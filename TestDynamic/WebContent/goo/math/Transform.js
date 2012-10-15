define(function() {
	function Transform() {
		this.translation = new THREE.Vector3();
		this.matrix = new THREE.Matrix4();
	}

	return Transform;
});
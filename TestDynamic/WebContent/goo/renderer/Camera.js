define(function() {
	function Camera(fov, aspect, near, far) {
		var tmpCam = new THREE.PerspectiveCamera(45, 1, 1, 1000);
		tmpCam.position.z = 100;
		this.cam = tmpCam;
		// this.viewMatrix = new THREE.Matrix4();
	}

	return Camera;
});
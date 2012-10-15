define(function() {
	function Camera(fov, aspect, near, far) {
		var tmpCam = new THREE.PerspectiveCamera(90, 1, 1, 1000);
		tmpCam.position.set(10, 5, 10);
		tmpCam.lookAt(new THREE.Vector3(0, 0, 0));

		tmpCam.updateMatrix();
		tmpCam.updateMatrixWorld();
		tmpCam.matrixWorldInverse.getInverse(tmpCam.matrixWorld);

		this.cam = tmpCam;

		// camera.updateMatrix(); // make sure camera's local matrix is updated
		// camera.updateMatrixWorld(); // make sure camera's world matrix is
		// updated
		// camera.matrixWorldInverse.getInverse( camera.matrixWorld );
		//
		// plane.updateMatrix(); // make sure plane's local matrix is updated
		// plane.updateMatrixWorld(); // make sure plane's world matrix is
		// updated
		//
		// var frustum = new THREE.Frustum();
		// frustum.setFromMatrix( new THREE.Matrix4().multiply(
		// camera.projectionMatrix, camera.matrixWorldInverse ) );
		// alert( frustum.contains( plane ) );
	}
	
	Camera.prototype.

	return Camera;
});
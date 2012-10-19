define(function() {
	function Camera(fov, aspect, near, far) {
		THREE.PerspectiveCamera.call(this, fov, aspect, near, far);

		this.position.set(200, 150, 200);
		this.lookAt(new THREE.Vector3(0, 0, 0));

		var that = this;
		this.position.watch(function() {
			that.updateWorld();
		});
		this.projectionMatrix.watch(function() {
			that.updateProjection();
		});

		this.updateWorld();

		// var frustum = new THREE.Frustum();
		// frustum.setFromMatrix( new THREE.Matrix4().multiply(
		// camera.projectionMatrix, camera.matrixWorldInverse ) );
	}

	Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

	Camera.prototype.updateWorld = function() {
		this.updateMatrix();
		this.updateMatrixWorld();
		this.matrixWorldInverse.getInverse(this.matrixWorld);
	};

	Camera.prototype.updateProjection = function() {
		this.updateProjectionMatrix();
	};

	return Camera;
});
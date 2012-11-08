define(function() {
	"use strict";

	function Camera(fov, aspect, near, far) {
		THREE.PerspectiveCamera.call(this, fov, aspect, near, far);

		this.position.set(0, 0, 50);
		this.lookAt(new THREE.Vector3(0, 0, 1));

		this.frustum = new THREE.Frustum();
		this._projScreenMatrix = new THREE.Matrix4();

		this.updateWorld();
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

	Camera.prototype.updateFrustum = function() {
		this._projScreenMatrix.multiply(this.projectionMatrix, this.matrixWorldInverse);
		this.frustum.setFromMatrix(this._projScreenMatrix);
	};

	return Camera;
});
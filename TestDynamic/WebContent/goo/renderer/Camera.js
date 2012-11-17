define(['goo/math/Vector3', 'goo/math/Matrix4x4'], function(Vector3, Matrix4x4) {
	"use strict";

	function Camera(fov, aspect, near, far) {
		THREE.PerspectiveCamera.call(this, fov, aspect, near, far);

		this.position.set(0, 0, 50);
		this.lookAt(new Vector3(0, 0, 1));

		this.frustum = new THREE.Frustum();
		this._projScreenMatrix = new Matrix4x4();

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
		this._projScreenMatrix.mul(this.projectionMatrix, this.matrixWorldInverse);
		this._projScreenMatrix.elements = this._projScreenMatrix.data;
		this.frustum.setFromMatrix(this._projScreenMatrix);
	};

	return Camera;
});
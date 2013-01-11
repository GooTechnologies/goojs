define(['goo/entities/components/Component', 'goo/math/Vector3'],
	/** @lends CameraComponent */
	function (Component, Vector3) {
	"use strict";

	/**
	 * @class TODO: this class is not finished
	 * @param {Camera} camera Camera to contain in this component
	 */
	function CameraComponent(camera) {
		this.type = 'CameraComponent';

		this.camera = camera;
	}

	CameraComponent.prototype = Object.create(Component.prototype);

	CameraComponent.prototype.updateCamera = function (transform) {
		// var vec1 = new Vector3(0, 0, 0);
		// transform.matrix.applyPost(vec1);
		//
		// var vec2 = new Vector3(0, 0, 1);
		// transform.matrix.applyPost(vec2);
		//
		// this.camera.translation.copy(vec1);
		// this.camera.lookAt(vec2, Vector3.UNIT_Y);
		//
		// this.camera.onFrameChange();
	};

	return CameraComponent;
});
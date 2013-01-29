define(['goo/entities/components/Component', 'goo/math/Vector3'],
/** @lends CameraComponent */
function(Component, Vector3) {
	"use strict";

	/**
	 * @class Updates the contained camera according to a transform (coming from the transformcomponent)
	 * @param {Camera} camera Camera to contain in this component
	 */
	function CameraComponent(camera) {
		this.type = 'CameraComponent';

		this.camera = camera;
	}

	CameraComponent.prototype = Object.create(Component.prototype);

	CameraComponent.prototype.updateCamera = function(transform) {
		this.camera._left.set(-1, 0, 0);
		transform.matrix.applyPostVector(this.camera._left);

		this.camera._up.set(0, 1, 0);
		transform.matrix.applyPostVector(this.camera._up);
		
		this.camera._direction.set(0, 0, -1);
		transform.matrix.applyPostVector(this.camera._direction);
		
		transform.matrix.getTranslation(this.camera.translation);
		
		this.camera.update();
	};

	return CameraComponent;
});
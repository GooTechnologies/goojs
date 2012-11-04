define(['goo/entities/components/Component'], function(Component) {
	"use strict";

	function CameraComponent(camera) {
		this.type = 'CameraComponent';

		this.camera = camera;
	}

	CameraComponent.prototype = Object.create(Component.prototype);

	CameraComponent.prototype.updateCamera = function(transform) {
		// this.camera.position.copy(transform.translation);

		// this.matrix.lookAt(this.position, vector, this.up);
		// this.rotation.setEulerFromRotationMatrix(this.matrix, this.eulerOrder);

		// this.camera.updateWorld();
	};

	return CameraComponent;
});
define(['goo/entities/components/Component'], function(Component) {
	"use strict";

	function CameraComponent(camera) {
		this.type = 'CameraComponent';

		this.camera = camera;
	}

	CameraComponent.prototype = Object.create(Component.prototype);

	CameraComponent.prototype.updateCamera = function(transform) {

	};

	return CameraComponent;
});
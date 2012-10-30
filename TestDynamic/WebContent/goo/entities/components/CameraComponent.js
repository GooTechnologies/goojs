define(['goo/entities/components/Component'], function(Component) {
	"use strict";

	function CameraComponent(camera) {
		this.type = 'CameraComponent';

		this.camera = camera;
	}

	CameraComponent.prototype = Object.create(Component.prototype);

	return CameraComponent;
});
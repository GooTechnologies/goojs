define(['goo/entities/components/Component'],
/** @lends */
function(Component) {
	"use strict";

	function CameraDebugComponent() {
		Component.call( this );
		this.type = 'CameraDebugComponent';
		this.api = {
			'cameraDebugComponent': this
		};
	}

	CameraDebugComponent.prototype = Object.create(Component.prototype);

	return CameraDebugComponent;
});
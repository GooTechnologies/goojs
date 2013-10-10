define(['goo/entities/components/Component'],
/** @lends */
function(Component) {
	"use strict";

	function CameraDebugComponent() {
		this.type = 'CameraDebugComponent';
	}

	CameraDebugComponent.prototype = Object.create(Component.prototype);

	return CameraDebugComponent;
});
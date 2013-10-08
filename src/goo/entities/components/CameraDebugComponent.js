define(['goo/entities/components/Component'],
/** @lends */
function(Component) {
	"use strict";

	function CameraDebugComponent() {
		Component.call(this, 'CameraDebugComponent', false);
	}

	CameraDebugComponent.prototype = Object.create(Component.prototype);

	return CameraDebugComponent;
});
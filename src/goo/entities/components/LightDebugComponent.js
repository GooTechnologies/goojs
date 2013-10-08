define(['goo/entities/components/Component'],
/** @lends */
function(Component) {
	"use strict";

	function LightDebugComponent() {
		Component.call(this, 'LightDebugComponent', false);
	}

	LightDebugComponent.prototype = Object.create(Component.prototype);

	return LightDebugComponent;
});
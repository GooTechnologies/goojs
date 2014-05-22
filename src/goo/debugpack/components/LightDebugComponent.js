define(['goo/entities/components/Component'],
/** @lends */
function (Component) {
	'use strict';

	function LightDebugComponent() {
		this.type = 'LightDebugComponent';
	}

	LightDebugComponent.prototype = Object.create(Component.prototype);

	return LightDebugComponent;
});
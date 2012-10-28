define(['goo/entities/components/Component'], function(Component) {
	"use strict";

	function LightComponent(light) {
		this.type = 'LightComponent';

		this.light = light;
	}

	LightComponent.prototype = Object.create(Component.prototype);

	LightComponent.prototype.stuff = function() {
	};

	return LightComponent;
});
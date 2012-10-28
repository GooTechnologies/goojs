define(function() {
	"use strict";

	function LightComponent(light) {
		this.type = 'LightComponent';

		this.light = light;
	}

	LightComponent.prototype.stuff = function() {
	};

	return LightComponent;
});
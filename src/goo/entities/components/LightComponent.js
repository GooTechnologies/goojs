define(['goo/entities/components/Component'], function (Component) {
	"use strict";

	/**
	 * @name LightComponent
	 * @class Defines a light
	 * @param {Light} light Light to contain in this component (directional, spot, point)
	 */
	function LightComponent(light) {
		this.type = 'LightComponent';

		this.light = light;
	}

	LightComponent.prototype = Object.create(Component.prototype);

	LightComponent.prototype.stuff = function () {
	};

	return LightComponent;
});
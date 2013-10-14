define(['goo/entities/components/Component'],
	/** @lends */
	function (Component) {
	"use strict";

	/**
	 * @class Defines a light
	 * @param {Light} light Light to contain in this component (directional, spot, point)
	 */
	function LightComponent(light) {
		this.type = 'LightComponent';

		this.light = light;
	}

	LightComponent.prototype = Object.create(Component.prototype);

	LightComponent.prototype.updateLight = function (transform) {
		this.light.update(transform);
	};

	return LightComponent;
});
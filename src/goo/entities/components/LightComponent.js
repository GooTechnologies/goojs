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
		
		Component.call(this);

		this._intensityWriter = this.addOutputProperty("intensity", "float");
		var _this = this;
				
		this.addInputProperty("intensity", "float", light.intensity, function(nv) {
			light.intensity = nv;
			_this._intensityWriter(light.intensity);
		});
	}

	LightComponent.prototype = Object.create(Component.prototype);

	LightComponent.prototype.updateLight = function (transform) {
		this.light.update(transform);
	};

	return LightComponent;
});
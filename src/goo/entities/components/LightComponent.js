define([
	'goo/entities/components/Component',
	'goo/renderer/light/Light'
],

	function (
		Component,
		Light
	) {
	'use strict';

	/**
	 * Defines a light<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example
	 * @param {Light} light Light to contain in this component (directional, spot, point)
	 * @extends Component
	 */
	function LightComponent(light) {
		Component.apply(this, arguments);

		this.type = 'LightComponent';

        /**
         * Light contained in this component.
         */
		this.light = light;

		/**
		 * @type {boolean}
		 * @default
		 */
		this.hidden = false;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	LightComponent.type = 'LightComponent';

	LightComponent.prototype = Object.create(Component.prototype);
	LightComponent.prototype.constructor = LightComponent;

	LightComponent.prototype.updateLight = function (transform) {
		this.light.update(transform);
	};

	LightComponent.applyOnEntity = function(obj, entity) {
		if (obj instanceof Light) {
			var lightComponent = new LightComponent(obj);
			entity.setComponent(lightComponent);
			return true;
		}
	};

	return LightComponent;
});
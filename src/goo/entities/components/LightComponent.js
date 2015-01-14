define([
	'goo/entities/components/Component',
	'goo/renderer/light/Light'
],
	/** @lends */
	function (
		Component,
		Light
	) {
	'use strict';

	/**
	 * @class Defines a light<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example}
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
	}

	LightComponent.type = 'LightComponent';

	LightComponent.prototype = Object.create(Component.prototype);
	LightComponent.prototype.constructor = LightComponent;

	LightComponent.prototype.updateLight = function (transform) {
		this.light.update(transform);
	};

	LightComponent.prototype.copy = function (source) {
		// has to be the same sort of light
		this.light.copy(source);

		// the status depends on the entity and its ancestors
		this.hidden = source.hidden;

		return this;
	};

	LightComponent.prototype.clone = function () {
		var clone = new LightComponent(this.light.clone());

		// this status needs updating
		clone.hidden = this.hidden;
		return clone;
	};

	LightComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof Light) {
			var lightComponent = new LightComponent(obj);
			entity.setComponent(lightComponent);
			return true;
		}
	};

	return LightComponent;
});
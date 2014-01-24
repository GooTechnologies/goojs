define([
	'goo/renderer/light/Light'
	],
/** @lends */
	function (
	Light
	) {
	'use strict';

	/**
	 * @class A pointlight. So far it has the same effect as {@link Light}
	 * @extends Light
	 * @param {Vector3} [color=(1, 1, 1)] The color of the light
	 */
	function PointLight () {
		Light.apply(this, arguments);

		this.range = 1000;
	}

	PointLight.prototype = Object.create(Light.prototype);

	PointLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);
	};

	return PointLight;
});
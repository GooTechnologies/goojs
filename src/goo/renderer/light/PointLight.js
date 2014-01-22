define([
	'goo/renderer/light/Light'
	],
/** @lends */
	function (
	Light
	) {
	"use strict";

	/**
	 * @class A pointlight. So far it has the same effect as {@link Light}
	 * @extends Light
	 */
	function PointLight () {
		Light.call(this);

		this.range = 1000;
	}

	PointLight.prototype = Object.create(Light.prototype);
	PointLight.prototype.constructor = PointLight;

	PointLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);
	};

	return PointLight;
});
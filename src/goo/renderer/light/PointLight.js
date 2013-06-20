define([
		'goo/math/Vector3',
		'goo/renderer/light/Light'
		],
/** @lends */
function (
	Vector3,
	Light
	) {
	"use strict";

	/**
	 * @class A pointlight. So far it has the same effect as {@link Light}
	 * @extends Light
	 */
	function PointLight () {
		Light.call(this);

		this.direction = new Vector3();
		this.range = 100;
	}

	PointLight.prototype = Object.create(Light.prototype);

	return PointLight;
});
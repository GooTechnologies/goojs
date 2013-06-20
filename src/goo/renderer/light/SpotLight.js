define([
		'goo/math/Vector3',
		'goo/renderer/light/Light'
		],
/* @lends */
function (
	Vector3,
	Light
	) {
	"use strict";

	/**
	 * @class A Spotlight. So far it has the same effect as {@link Light}
	 * @extends Light
	 */
	function SpotLight () {
		Light.call(this);

		this.direction = new Vector3();
		this.spotAngle = 45;
	}

	SpotLight.prototype = Object.create(Light.prototype);

	return SpotLight;
});
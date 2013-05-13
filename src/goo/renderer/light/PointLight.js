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
	 * @class It's a damn directional light
	 * @property {Vector3} direction Where it is looking
	 */
	function PointLight () {
		Light.call(this);

		this.direction = new Vector3();
		this.range = 100;
	}

	PointLight.prototype = Object.create(Light.prototype);

	return PointLight;
});
define([
		'goo/math/Vector3',
		'goo/renderer/light/Light'
		],
/** @lends SpotLight */
function (
	Vector3,
	Light
	) {
	"use strict";

	/**
	 * @class It's a damn directional light
	 * @property {Vector3} direction Where it is looking
	 */
	function SpotLight () {
		Light.call(this);

		this.direction = new Vector3();
		this.spotAngle = 45;
	}

	SpotLight.prototype = Object.create(Light.prototype);

	return SpotLight;
});
define([
        'goo/math/Vector3',
        'goo/renderer/light/Light'
        ],
/** @lends PointLight */
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
		System.call(this);

		this.direction = new Vector3();
	}

	PointLight.prototype = Object.create(Light.prototype);

	return Light;
});
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
	function DirectionalLight () {
		Light.call(this);

		this.direction = new Vector3();
	}

	DirectionalLight.prototype = Object.create(Light.prototype);

	return DirectionalLight;
});
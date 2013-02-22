define([
		'goo/math/Vector3',
		'goo/renderer/light/Light',
		'goo/entities/systems/System'
		],
/** @lends DirectionalLight */
function (
	Vector3,
	Light,
	System
	) {
	"use strict";

	/**
	 * @class It's a damn directional light
	 * @property {Vector3} direction Where it is looking
	 */
	function DirectionalLight () {
		System.call(this);

		this.direction = new Vector3();
	}

	DirectionalLight.prototype = Object.create(Light.prototype);

	return Light;
});
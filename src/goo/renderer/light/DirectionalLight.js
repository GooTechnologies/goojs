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
	 * @class A directional light. So far it has the same effect as {@link Light}
	 * @extends Light
	 */
	function DirectionalLight () {
		Light.call(this);

		/** @type {Vector3} */
		this.direction = new Vector3();
	}

	DirectionalLight.prototype = Object.create(Light.prototype);

	return DirectionalLight;
});
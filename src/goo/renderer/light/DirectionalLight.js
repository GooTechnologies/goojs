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

	DirectionalLight.prototype.update = function (transform) {


		transform.matrix.getTranslation(this.translation);

		this.direction.setd(0.0, 0.0, -1.0);

		transform.matrix.applyPostVector(this.direction);
	};

	return DirectionalLight;
});
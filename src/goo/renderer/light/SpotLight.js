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
		this.range = 1000;
		this.angle = 45;
		this.exponent = 16.0;
	}

	SpotLight.prototype = Object.create(Light.prototype);

	SpotLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);

		this.direction.setd(0.0, 0.0, 1.0);
		transform.matrix.applyPostVector(this.direction);
	};

	return SpotLight;
});
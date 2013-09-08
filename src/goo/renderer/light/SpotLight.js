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
	 * @class
	 * The SpotLight can be viewed as two cones with their apexes located at the light's location.
	 * The properties angle sets the angle (in degrees) for which the outer cone
	 * deviates from the light's direction. The exponent property sets the angle for the inner cone.
	 *
	 * The angle property is also known as the outer angle or falloff. The exponent property is also known as
	 * the inner angle or hotspot.
	 * @extends Light
	 */
	function SpotLight () {
		Light.call(this);

		/** @type {Vector3} */
		this.direction = new Vector3();
		/** @type {Number} */
		this.range = 1000;
		/** @type {Number} */
		this.angle = 45;
		/** @type {Number} */
		this.penumbra = null;
		/** @type {Number} */
		this.exponent = 16.0;
	}

	SpotLight.prototype = Object.create(Light.prototype);

	SpotLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);

		this.direction.setd(0.0, 0.0, -1.0);
		transform.matrix.applyPostVector(this.direction);
	};

	return SpotLight;
});
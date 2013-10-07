define([
		'goo/math/Vector3',
		'goo/entities/components/Light'
		],
/** @lends */
function (
	Vector3,
	Light
	) {
	"use strict";

	/**
	 * @class A pointlight. So far it has the same effect as {@link Light}
	 * @extends Light
	 */
	function PointLight () {
		Light.call(this);

		this.range = 1000;
	}

	PointLight.prototype = Object.create(Light.prototype);

	PointLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);
	};

	return PointLight;
});
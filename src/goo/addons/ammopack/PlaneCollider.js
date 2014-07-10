define([
	'goo/addons/ammopack/Collider',
	'goo/math/Vector3'
],
/** @lends */
function (
	Collider,
	Vector3
) {
	'use strict';

	/**
	 * @class
	 * @param {object} settings
	 */
	function PlaneCollider(settings) {
		settings = settings || {};

		/**
		 * Plane normal
		 * @type {Vector3}
		 */
		this.normal = typeof(settings.normal) !== 'undefined' ? new Vector3(settings.normal) : new Vector3(0, 1, 0);

		/**
		 * Plane constant
		 * @type {number}
		 */
		this.planeConstant = typeof settings.planeConstant === 'number' ? settings.planeConstant : 0;
	}
	PlaneCollider.prototype = Object.create(Collider.prototype);
	PlaneCollider.constructor = PlaneCollider;

	PlaneCollider.prototype.serialize = function () {
		return {
			type: 'plane',
			normal: Array.prototype.slice.call(this.normal.data, 0),
			planeConstant: this.planeConstant
		};
	};

	return PlaneCollider;
});

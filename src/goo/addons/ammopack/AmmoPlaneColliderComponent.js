define([
	'goo/entities/components/Component',
	'goo/shapes/Box',
	'goo/math/Vector3'
],
/** @lends */
function (
	Component,
	Box,
	Vector3
) {
	'use strict';

	/**
	 * @class
	 * @param {object} settings
	 */
	function AmmoPlaneColliderComponent(settings) {
		this.type = 'AmmoColliderComponent';

		settings = settings || {};

		/**
		 * Plane normal
		 * @type {Vector3}
		 */
		this.normal = settings.normal || new Vector3(0, 1, 0);

		/**
		 * Plane constant
		 * @type {number}
		 */
		this.planeConstant = typeof settings.planeConstant === 'number' ? settings.planeConstant : 0;
	}
	AmmoPlaneColliderComponent.prototype = Object.create(Component.prototype);
	AmmoPlaneColliderComponent.constructor = AmmoPlaneColliderComponent;

	AmmoPlaneColliderComponent.prototype.serialize = function () {
		return {
			type: 'plane',
			normal: Array.prototype.slice.call(this.normal.data, 0),
			planeConstant: this.planeConstant
		};
	};

	return AmmoPlaneColliderComponent;
});

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
	function AmmoBoxColliderComponent(settings) {
		this.type = "AmmoColliderComponent";

		settings = settings || {};

		/**
		 * The half extents of the collider box.
		 * @type {Vector3}
		 */
		this.halfExtents = settings.halfExtents || new Vector3(0.5, 0.5, 0.5);
	}
	AmmoBoxColliderComponent.prototype = Object.create(Component.prototype);
	AmmoBoxColliderComponent.constructor = AmmoBoxColliderComponent;

	AmmoBoxColliderComponent.prototype.serialize = function () {
		return {
			type: 'box',
			halfExtents: Array.prototype.slice.call(this.halfExtents.data, 0)
		};
	};

	return AmmoBoxColliderComponent;
});

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
	function CylinderCollider(settings) {
		settings = settings || {};

		/**
		 * The half extents of the collider box.
		 * @type {Vector3}
		 */
		this.halfExtents = typeof(settings.halfExtents) !== 'undefined' ? new Vector3(settings.halfExtents) : new Vector3(0.5, 0.5, 0.5);
	}
	CylinderCollider.prototype = Object.create(Collider.prototype);
	CylinderCollider.prototype.constructor = CylinderCollider;

	CylinderCollider.prototype.serialize = function () {
		return {
			type: 'cylinder',
			halfExtents: Array.prototype.slice.call(this.halfExtents.data)
		};
	};

	return CylinderCollider;
});

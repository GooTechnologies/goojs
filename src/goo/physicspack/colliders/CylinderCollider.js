define([
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Collider
) {
	'use strict';

	/**
	 * @class Cylinder collider, that extends along the Z axis.
	 * @param {object} [settings]
	 * @param {number} [settings.radius=0.5]
	 * @param {number} [settings.height=1]
	 * @extends Collider
	 */
	function CylinderCollider(settings) {
		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.radius = settings.radius !== undefined ? settings.radius : 0.5;

		/**
		 * @type {number}
		 */
		this.height = settings.height !== undefined ? settings.height : 1;

		Collider.call(this);
	}
	CylinderCollider.prototype = Object.create(Collider.prototype);
	CylinderCollider.constructor = CylinderCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	CylinderCollider.prototype.transform = function (transform, targetCollider) {
		var s = transform.scale;
		targetCollider.radius = Math.max(s[0], s[1]) * this.radius;
		targetCollider.height = s[2] * this.height;
	};

	/**
	 * @return {CylinderCollider}
	 */
	CylinderCollider.prototype.clone = function () {
		return new CylinderCollider({
			radius: this.radius,
			height: this.height
		});
	};

	return CylinderCollider;
});

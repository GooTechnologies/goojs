var Collider = require('goo/addons/physicspack/colliders/Collider');

	'use strict';

	/**
	 * Cylinder collider, that extends along the Z axis.
	 * @param {Object} [settings]
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
	CylinderCollider.prototype.constructor = CylinderCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	CylinderCollider.prototype.transform = function (transform, targetCollider) {
		var s = transform.scale;
		targetCollider.radius = Math.max(s.x, s.y) * this.radius;
		targetCollider.height = s.z * this.height;
	};

	/**
	 * @returns {CylinderCollider}
	 */
	CylinderCollider.prototype.clone = function () {
		return new CylinderCollider({
			radius: this.radius,
			height: this.height
		});
	};

	module.exports = CylinderCollider;

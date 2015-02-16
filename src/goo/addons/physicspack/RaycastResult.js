define([
	'goo/math/Vector3'
],
function (
	Vector3
) {
	'use strict';

	/**
	 * Result container for the {@link PhysicsSystem} and {@link AmmoPhysicsSystem}.
	 * @param {number} distance
	 * @param {Entity} entity
	 * @param {boolean} hit
	 * @param {Vector3} normal
	 * @param {Vector3} point
	 */
	function RaycastResult(settings) {
		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.distance = settings.distance || -1;

		/**
		 * @type {Entity}
		 */
		this.entity = settings.entity || null;

		/**
		 * @type {boolean}
		 */
		this.hit = settings.hit || false;

		/**
		 * @type {Vector3}
		 */
		this.normal = settings.normal ? settings.normal.clone() : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.point = settings.point ? settings.point.clone() : new Vector3();
	}

	RaycastResult.prototype.reset = function () {
		this.distance = -1;
		this.entity = null;
		this.hit = false;
		this.normal.setDirect(0,0,0);
		this.point.setDirect(0,0,0);
	};

	return RaycastResult;
});
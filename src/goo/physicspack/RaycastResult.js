define([
	'goo/math/Vector3'
],
function (
	Vector3
) {
	'use strict';

	/**
	 * Result container for the {@link PhysicsSystem} and {@link AmmoPhysicsSystem}.
	 * @param {Vector3} normal
	 * @param {Vector3} point
	 * @param {Entity} entity
	 */
	function RaycastResult(settings) {
		settings = settings || {};

		/**
		 * @type {Vector3}
		 */
		this.point = settings.point ? settings.point.clone() : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.normal = settings.normal ? settings.normal.clone() : new Vector3();

		/**
		 * @type {Entity}
		 */
		this.entity = settings.entity || null;
	}

	RaycastResult.prototype.reset = function () {
		this.entity = null;
	};

	return RaycastResult;
});
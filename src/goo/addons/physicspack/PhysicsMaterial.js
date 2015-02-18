define([], function () {
	'use strict';

	/**
	 */
	function PhysicsMaterial(settings) {
		settings = settings || {};

		/**
		 * The friction coefficient. Multiplication is used to combine two friction values.
		 * @type {number}
		 */
		this.friction = settings.friction !== undefined ? settings.friction : 0.3;

		/**
		 * The "bounciness" of the collider.
		 * @type {number}
		 */
		this.restitution = settings.restitution !== undefined ? settings.restitution : 0;
	}
	PhysicsMaterial.prototype.constructor = PhysicsMaterial;

	return PhysicsMaterial;
});

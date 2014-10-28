define([
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Collider
) {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {number} [settings.radius=0.5]
	 * @extends Collider
	 */
	function SphereCollider(settings) {
		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.radius = settings.radius || 0.5;

		Collider.call(this);
	}
	SphereCollider.prototype = Object.create(Collider.prototype);
	SphereCollider.constructor = SphereCollider;

	return SphereCollider;
});

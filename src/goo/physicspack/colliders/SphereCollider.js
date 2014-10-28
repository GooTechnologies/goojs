define([
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Collider
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {number} [settings.radius=0.5]
	 */
	function SphereCollider(settings) {
		settings = settings || {};

		var radius = settings.radius || 0.5;

		Collider.call(this, {
			cannonShape: new CANNON.Sphere(radius)
		});
	}
	SphereCollider.prototype = Object.create(Collider.prototype);
	SphereCollider.constructor = SphereCollider;

	return SphereCollider;
});

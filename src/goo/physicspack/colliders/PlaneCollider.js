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
	 * @extends Collider
	 */
	function PlaneCollider(settings) {
		settings = settings || {};

		Collider.call(this);
	}
	PlaneCollider.prototype = Object.create(Collider.prototype);
	PlaneCollider.constructor = PlaneCollider;

	return PlaneCollider;
});

define([
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Box,
	Vector3,
	Collider
) {
	'use strict';

	/**
	 * @class Physics box collider.
	 * @param {object} [settings]
	 * @param {Vector3} [settings.halfExtents] The half-extents of the box collider.
	 * @extends Collider
	 */
	function BoxCollider(settings) {
		settings = settings || {};

		/**
		 * @type {Vector3}
		 */
		this.halfExtents = settings.halfExtents ? settings.halfExtents.clone() : new Vector3(0.5, 0.5, 0.5);

		Collider.call(this);
	}

	BoxCollider.prototype = Object.create(Collider.prototype);
	BoxCollider.constructor = BoxCollider;

	return BoxCollider;
});

define([
	'goo/math/Vector3',
	'goo/addons/physicspack/colliders/Collider'
],
function (
	Vector3,
	Collider
) {
	'use strict';

	/**
	 * Physics box collider.
	 * @param {Object} [settings]
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
	BoxCollider.prototype.constructor = BoxCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	BoxCollider.prototype.transform = function (transform, targetCollider) {
		targetCollider.halfExtents.setVector(transform.scale).mulVector(this.halfExtents);
	};

	/**
	 * Clone the collider
	 * @returns {BoxCollider}
	 */
	BoxCollider.prototype.clone = function () {
		return new BoxCollider({
			halfExtents: this.halfExtents
		});
	};

	return BoxCollider;
});

define([
	'goo/addons/physicspack/colliders/Collider'
],
function (
	Collider
) {
	'use strict';

	/**
	 * Plane collider, that faces in the Z direction.
	 * @class
	 * @extends Collider
	 */
	function PlaneCollider() {
		Collider.call(this);
	}
	PlaneCollider.prototype = Object.create(Collider.prototype);
	PlaneCollider.prototype.constructor = PlaneCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	PlaneCollider.prototype.transform = function (/*transform, targetCollider*/) {};

	/**
	 * @returns {PlaneCollider}
	 */
	PlaneCollider.prototype.clone = function () {
		return new PlaneCollider();
	};

	return PlaneCollider;
});

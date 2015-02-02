define([
	'goo/physicspack/colliders/Collider'
],
function (
	Collider
) {
	'use strict';

	/**
	 * @class Plane collider, that faces in the Z direction.
	 * @param {object} [settings]
	 * @extends Collider
	 */
	function PlaneCollider(settings) {
		settings = settings || {};

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
	 * @return {PlaneCollider}
	 */
	PlaneCollider.prototype.clone = function () {
		return new PlaneCollider();
	};

	return PlaneCollider;
});

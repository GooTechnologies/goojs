define([],
function () {
	'use strict';

	/**
	 * Base class for Colliders.
	 * @class
	 */
	function Collider() {}

	/**
	 * @virtual
	 * @returns {Collider}
	 */
	Collider.prototype.clone = function () {
		return new Collider();
	};

	/**
	 * @private
	 * @virtual
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	Collider.prototype.transform = function (/*transform, targetCollider*/) {};

	return Collider;
});

define([
	'goo/entities/components/Component',
	'goo/shapes/Box',
	'goo/math/Vector3'
],
/** @lends */
function (
	Component,
	Box,
	Vector3
) {
	'use strict';

	/**
	 * @class
	 * @param {object} settings
	 */
	function BoxCollider(settings) {
		settings = settings || {};

		/**
		 * The half extents of the collider box.
		 * @type {Vector3}
		 */
		this.halfExtents = typeof(settings.halfExtents) !== 'undefined' ? new Vector3(settings.halfExtents) : new Vector3(0.5, 0.5, 0.5);
	}
	BoxCollider.prototype = Object.create(Component.prototype);
	BoxCollider.constructor = BoxCollider;

	BoxCollider.prototype.serialize = function () {
		return {
			type: 'box',
			halfExtents: Array.prototype.slice.call(this.halfExtents.data, 0)
		};
	};

	return BoxCollider;
});

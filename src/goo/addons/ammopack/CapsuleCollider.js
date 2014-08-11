define([
	'goo/addons/ammopack/Collider'
],
/** @lends */
function (
	Collider
) {
	'use strict';

	/**
	 * @class
	 * @param {object} settings
	 * @param {number} [radius=0.5]
	 * @param {number} [height=1]
	 * @todo Implement me!
	 */
	function CapsuleCollider(settings) {
		/**
		 * @type {number}
		 */
		this.radius = typeof(settings.radius) === 'number' ? settings.radius : 0.5;

		/**
		 * @type {number}
		 */
		this.height = typeof(height) === 'number' ? settings.height : 1;
	}
	CapsuleCollider.prototype = Object.create(Collider.prototype);
	CapsuleCollider.constructor = CapsuleCollider;

	return CapsuleCollider;
});

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
	 */
	function SphereCollider(settings) {
		this.type = "AmmoColliderComponent";

		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.radius = typeof(settings.radius) === 'number' ? settings.radius : 0.5;
	}
	SphereCollider.prototype = Object.create(Collider.prototype);
	SphereCollider.constructor = SphereCollider;

	SphereCollider.prototype.serialize = function () {
		return {
			type: 'sphere',
			radius: this.radius
		};
	};

	return SphereCollider;
});

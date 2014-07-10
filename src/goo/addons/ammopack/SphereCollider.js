define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
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
	SphereCollider.prototype = Object.create(Component.prototype);
	SphereCollider.constructor = SphereCollider;

	SphereCollider.prototype.serialize = function () {
		return {
			type: 'sphere',
			radius: this.radius
		};
	};

	return SphereCollider;
});

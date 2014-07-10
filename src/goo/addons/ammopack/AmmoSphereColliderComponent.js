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
	function AmmoSphereColliderComponent(settings) {
		this.type = "AmmoColliderComponent";

		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.radius = settings.radius || 0.5;
	}
	AmmoSphereColliderComponent.prototype = Object.create(Component.prototype);
	AmmoSphereColliderComponent.constructor = AmmoSphereColliderComponent;

	AmmoSphereColliderComponent.prototype.serialize = function () {
		return {
			type: 'sphere',
			radius: this.radius
		};
	};

	return AmmoSphereColliderComponent;
});

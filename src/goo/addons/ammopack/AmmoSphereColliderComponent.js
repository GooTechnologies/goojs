define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	'use strict';

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

	return AmmoSphereColliderComponent;
});

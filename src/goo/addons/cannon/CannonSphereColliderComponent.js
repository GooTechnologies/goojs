define([
	'goo/entities/components/Component'
],
/** @lends */
function(
	Component
){
	'use strict';

	var CANNON = window.CANNON;

	/**
	 * @class Sphere collider for the {@link CannonSystem}.
	 * @param {object} [settings]
	 * @param {number} [settings.radius=0.5]
	 */
	function CannonSphereColliderComponent(settings){
		settings = settings || {};
		this.type = 'CannonSphereColliderComponent';
		this.radius = settings.radius || 0.5;
		this.cannonShape = new CANNON.Sphere(this.radius);
	}
	CannonSphereColliderComponent.prototype = Object.create(Component.prototype);
	CannonSphereColliderComponent.constructor = CannonSphereColliderComponent;

	return CannonSphereColliderComponent;
});

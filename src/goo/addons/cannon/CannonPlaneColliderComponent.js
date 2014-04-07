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
	 * @class Plane collider. Attach to an entity with a {@link CannonRigidbodyComponent}.
	 * @param {object} [settings]
	 */
	function CannonPlaneColliderComponent(settings){
		this.type = "CannonPlaneColliderComponent";

		settings = settings || {};

		// Create shape
		this.cannonShape = new CANNON.Plane();
	}
	CannonPlaneColliderComponent.prototype = Object.create(Component.prototype);
	CannonPlaneColliderComponent.constructor = CannonPlaneColliderComponent;

	return CannonPlaneColliderComponent;
});

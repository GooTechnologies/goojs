define([
	'goo/entities/components/Component',
	'goo/shapes/Box',
	'goo/math/Vector3'
], function(
	Component,
	Box,
	Vector3
){

	'use strict';

	var CANNON = window.CANNON;

	/**
	 * Physics box collider for Cannon.js. To be attached to an entity with a {@link CannonRigidbodyComponent}. Also see the {@link CannonSystem}.
	 * @param {object} [settings]
	 * @class
	 * @constructor
	 * @extends Component
	 */
	function CannonBoxColliderComponent(settings){
		this.type = "CannonBoxColliderComponent";

		settings = settings || {};
		var e = this.halfExtents = settings.halfExtents || new Vector3(0.5, 0.5, 0.5);

		// Create shape
		this.cannonShape = new CANNON.Box(new CANNON.Vec3(e.x, e.y, e.z));
	}
	CannonBoxColliderComponent.prototype = Object.create(Component.prototype);
	CannonBoxColliderComponent.constructor = CannonBoxColliderComponent;

	return CannonBoxColliderComponent;
});

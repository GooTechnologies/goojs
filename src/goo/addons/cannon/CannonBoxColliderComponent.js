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

	// Todo: copy pasted from Ammo, convert to Cannon
	function CannonBoxColliderComponent(settings){
		this.type = "CannonColliderComponent";

		settings = settings || {};
		var e = this.halfExtents = settings.halfExtents || new Vector3(0.5, 0.5, 0.5);

		// Create shape
		this.cannonShape = new CANNON.Box(new CANNON.Vec3(e.x, e.y, e.z));
	}
	CannonBoxColliderComponent.prototype = Object.create(Component.prototype);
	CannonBoxColliderComponent.constructor = CannonBoxColliderComponent;

	return CannonBoxColliderComponent;
});

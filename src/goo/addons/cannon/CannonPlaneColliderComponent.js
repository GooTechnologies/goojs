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

	function CannonPlaneColliderComponent(settings){
		this.type = "CannonPlaneColliderComponent";

		settings = settings || {};

		// Create shape
		this.cannonShape = new CANNON.Plane();
	};
	CannonPlaneColliderComponent.prototype = Object.create(Component.prototype);
	CannonPlaneColliderComponent.constructor = CannonPlaneColliderComponent;

	return CannonPlaneColliderComponent;
});

define([
	'goo/entities/components/Component'
], function(
	Component
){
	'use strict';

	var CANNON = window.CANNON;

	function CannonSphereColliderComponent(settings){
		settings = settings || {};
		this.type = 'CannonColliderComponent';
		this.radius = settings.radius || 0.5;
		this.cannonShape = new CANNON.Sphere(this.radius);
	}
	CannonSphereColliderComponent.prototype = Object.create(Component.prototype);
	CannonSphereColliderComponent.constructor = CannonSphereColliderComponent;

	return CannonSphereColliderComponent;
});

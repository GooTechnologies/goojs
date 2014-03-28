define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil'
], function(
	Component,
	_
){
	'use strict';

	var CANNON = window.CANNON;

	/**
	 * Distance joint
	 * @param {object} [settings]
	 * @param {number} [settings.distance=1]
	 * @param {CannonRigidbodyComponent} [settings.connectedBody]
	 */
	function CannonDistanceJointComponent(settings){
		settings = settings || {};
		this.type = 'CannonDistanceJointComponent';

		_.defaults(settings,{
			distance : 1,
			connectedBody: null
		});

		this.distance = settings.distance;
		this.connectedBody = settings.connectedBody;

		this.cannonConstraint = null;
	}
	CannonDistanceJointComponent.prototype = Object.create(Component.prototype);
	CannonDistanceJointComponent.constructor = CannonDistanceJointComponent;

	CannonDistanceJointComponent.prototype.createConstraint = function(entity){
		var bodyA = entity.cannonRigidbodyComponent.body;
		var bodyB = this.connectedBody.body;
		this.cannonConstraint = new CANNON.DistanceConstraint(bodyA, bodyB, this.distance);
		return this.cannonConstraint;
	};

	return CannonDistanceJointComponent;
});

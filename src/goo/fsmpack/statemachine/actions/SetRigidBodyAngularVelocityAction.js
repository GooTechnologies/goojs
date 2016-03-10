define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3'
], function (
	Action,
	Vector3
) {
	'use strict';

	function SetRigidBodyAngularVelocityAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetRigidBodyAngularVelocityAction.prototype = Object.create(Action.prototype);
	SetRigidBodyAngularVelocityAction.prototype.constructor = SetRigidBodyAngularVelocityAction;

	SetRigidBodyAngularVelocityAction.external = {
		key: 'Set Rigid Body Angular Velocity',
		name: 'Set Rigid Body Angular Velocity',
		type: 'physics',
		description: 'Set the angular velocity of the rigid body component.',
		canTransition: false,
		parameters: [{
			name: 'Angular velocity',
			key: 'velocity',
			type: 'position',
			description: 'Angular velocity to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	var tmpVector = new Vector3();
	SetRigidBodyAngularVelocityAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.velocity);
		entity.rigidBodyComponent.setAngularVelocity(tmpVector);
	};

	return SetRigidBodyAngularVelocityAction;
});
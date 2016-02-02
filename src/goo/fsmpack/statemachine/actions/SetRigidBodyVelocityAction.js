define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3'
], function (
	Action,
	Vector3
) {
	'use strict';

	function SetRigidBodyVelocityAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetRigidBodyVelocityAction.prototype = Object.create(Action.prototype);
	SetRigidBodyVelocityAction.prototype.constructor = SetRigidBodyVelocityAction;

	SetRigidBodyVelocityAction.external = {
		name: 'Set Rigid Body Velocity',
		type: 'physics',
		description: 'Set the linear velocity of the rigid body component.',
		canTransition: false,
		parameters: [{
			name: 'Velocity',
			key: 'velocity',
			type: 'position',
			description: 'Velocity to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	var tmpVector = new Vector3();
	SetRigidBodyVelocityAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.velocity);
		entity.rigidBodyComponent.setVelocity(tmpVector);
	};

	return SetRigidBodyVelocityAction;
});
var Action = require('./Action');
var Vector3 = require('./../../../math/Vector3');

function SetRigidBodyVelocityAction(/*id, settings*/) {
	Action.apply(this, arguments);
}
SetRigidBodyVelocityAction.prototype = Object.create(Action.prototype);
SetRigidBodyVelocityAction.prototype.constructor = SetRigidBodyVelocityAction;

SetRigidBodyVelocityAction.external = {
	key: 'Set Rigid Body Velocity',
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
SetRigidBodyVelocityAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	if (!entity || !entity.rigidBodyComponent) { return; }
	tmpVector.setArray(this.velocity);
	entity.rigidBodyComponent.setVelocity(tmpVector);
};

module.exports = SetRigidBodyVelocityAction;
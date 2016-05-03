var Action = require('./Action');
var Vector3 = require('./../../../math/Vector3');

function SetRigidBodyAngularVelocityAction() {
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
SetRigidBodyAngularVelocityAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (!entity || !entity.rigidBodyComponent) { return; }
	tmpVector.setArray(this.velocity);
	entity.rigidBodyComponent.setAngularVelocity(tmpVector);
};

module.exports = SetRigidBodyAngularVelocityAction;
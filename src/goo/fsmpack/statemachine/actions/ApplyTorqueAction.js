define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3',
	'goo/entities/SystemBus'
], function (
	Action,
	Vector3,
	SystemBus
) {
	'use strict';

	function ApplyTorqueAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyTorqueAction.prototype = Object.create(Action.prototype);
	ApplyTorqueAction.prototype.constructor = ApplyTorqueAction;

	ApplyTorqueAction.external = {
		name: 'ApplyTorque',
		type: 'physics',
		description: 'Apply a torque to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Torque',
			key: 'torque',
			type: 'position',
			description: 'Torque to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'Whether to apply the torque in local or world space.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	var torqueVector = new Vector3();
	ApplyTorqueAction.prototype._setup = function (fsm) {
		SystemBus.addListener('goo.physics.substep', this.substepListener = function () {
			var entity = fsm.getOwnerEntity();
			if (!entity || !entity.rigidBodyComponent) { return; }

			torqueVector.setArray(this.torque);
			if (this.space === 'World') {
				entity.rigidBodyComponent.applyTorque(torqueVector);
			} else {
				entity.rigidBodyComponent.applyTorqueLocal(torqueVector);
			}
		}.bind(this));
	};

	ApplyTorqueAction.prototype.exit = function () {
		SystemBus.removeListener('goo.physics.substep', this.substepListener);
	};

	return ApplyTorqueAction;
});
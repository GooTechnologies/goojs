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

	function ApplyForceAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyForceAction.prototype = Object.create(Action.prototype);
	ApplyForceAction.prototype.constructor = ApplyForceAction;

	ApplyForceAction.external = {
		name: 'ApplyForce',
		type: 'physics',
		description: 'Apply a force to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Force',
			key: 'force',
			type: 'position',
			description: 'Force to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Apply point',
			key: 'point',
			type: 'position',
			description: 'Where on the body to apply the force, relative to the center of mass.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'The space where the force and apply point are defined.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	var forceVector = new Vector3();
	var applyPoint = new Vector3();
	ApplyForceAction.prototype._setup = function (fsm) {
		SystemBus.addListener('goo.physics.substep', this.substepListener = function () {
			var entity = fsm.getOwnerEntity();
			if (!entity || !entity.rigidBodyComponent) { return; }

			forceVector.setArray(this.force);
			applyPoint.setArray(this.point);
			if (this.space === 'World') {
				entity.rigidBodyComponent.applyForce(forceVector, applyPoint);
			} else {
				entity.rigidBodyComponent.applyForceLocal(forceVector, applyPoint);
			}
		}.bind(this));
	};

	ApplyForceAction.prototype.exit = function () {
		SystemBus.removeListener('goo.physics.substep', this.substepListener);
	};

	return ApplyForceAction;
});
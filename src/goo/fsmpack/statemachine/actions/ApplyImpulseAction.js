define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3'
], function (
	Action,
	Vector3
) {
	'use strict';

	function ApplyImpulseAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyImpulseAction.prototype = Object.create(Action.prototype);
	ApplyImpulseAction.prototype.constructor = ApplyImpulseAction;

	ApplyImpulseAction.external = {
		name: 'ApplyImpulse',
		type: 'physics',
		description: 'Apply an impulse to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Impulse',
			key: 'impulse',
			type: 'position',
			description: 'Impulse to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Apply point',
			key: 'point',
			type: 'position',
			description: 'Where on the body to apply the impulse, relative to the center of mass.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'The space where the impulse and apply point are defined.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	ApplyImpulseAction.prototype.configure = function (settings) {
		this.impulse = settings.impulse;
		this.point = settings.point;
		this.space = settings.space;
	};

	ApplyImpulseAction.prototype._setup = function (/*fsm*/) {
	};

	ApplyImpulseAction.prototype.cleanup = function (/*fsm*/) {
	};

	var tempVector1 = new Vector3();
	var tempVector2 = new Vector3();
	ApplyImpulseAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		tempVector1.setArray(this.impulse);
		tempVector2.setArray(this.point);
		if (this.space === 'World') {
			entity.rigidBodyComponent.applyImpulse(tempVector1, tempVector2);
		} else {
			entity.rigidBodyComponent.applyImpulseLocal(tempVector1, tempVector2);
		}
	};

	return ApplyImpulseAction;
});
var Action = require('goo/fsmpack/statemachine/actions/Action');
var FsmUtils = require('goo/fsmpack/statemachine/FsmUtils');

	'use strict';

	function AddPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddPositionAction.prototype = Object.create(Action.prototype);

	AddPositionAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
		this.speed = settings.speed || 1;
	};

	AddPositionAction.external = {
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Amount to move on the X axis',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Amount to move on the Y axis',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Amount to move on the Z axis',
			'default': 0
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'float',
			description: 'Speed to multiply',
			'default': 1
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	AddPositionAction.prototype._run = function (fsm) {
		if (this.entity !== null) {
			var tpf = fsm.getTpf();

			var dx = FsmUtils.getValue(this.amountX, fsm);
			var dy = FsmUtils.getValue(this.amountY, fsm);
			var dz = FsmUtils.getValue(this.amountZ, fsm);

			this.entity.transformComponent.transform.translation.addDirect(
				dx * this.speed * tpf,
				dy * this.speed * tpf,
				dz * this.speed * tpf
			);

			this.entity.transformComponent.setUpdated();
		}
	};

	module.exports = AddPositionAction;
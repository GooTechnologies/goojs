var Action = require('../../../fsmpack/statemachine/actions/Action');
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

	'use strict';

	function SetRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRotationAction.prototype = Object.create(Action.prototype);

	SetRotationAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
	};

	SetRotationAction.external = {
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Amount to rotate on the X axis',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Amount to rotate on the Y axis',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Amount to rotate on the Z axis',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	SetRotationAction.prototype._run = function (fsm) {
		if (this.entity !== null) {
			this.entity.transformComponent.transform.setRotationXYZ(
				FsmUtils.getValue(this.amountX, fsm),
				FsmUtils.getValue(this.amountY, fsm),
				FsmUtils.getValue(this.amountZ, fsm)
			);
			this.entity.transformComponent.setUpdated();
		}
	};

	module.exports = SetRotationAction;
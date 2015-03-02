define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FSMUtil'
],
/** @lends */
function(
	Action,
	FSMUtil
) {
	'use strict';

	function SetRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRotationAction.prototype = Object.create(Action.prototype);

	SetRotationAction.prototype.configure = function(settings) {
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

	SetRotationAction.prototype._run = function(fsm) {
		if (this.entity !== null) {
			this.entity.transformComponent.transform.setRotationXYZ(
				FSMUtil.getValue(this.amountX, fsm),
				FSMUtil.getValue(this.amountY, fsm),
				FSMUtil.getValue(this.amountZ, fsm)
			);
			this.entity.transformComponent.setUpdated();
		}
	};

	return SetRotationAction;
});
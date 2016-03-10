define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FsmUtils'
], function (
	Action,
	FsmUtils
) {
	'use strict';

	function CopyVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CopyVariableAction.prototype = Object.create(Action.prototype);
	CopyVariableAction.prototype.constructor = CopyVariableAction;

	CopyVariableAction.external = {
		key: 'Copy Variable',
		name: 'Copy Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable Target',
			key: 'variableTarget',
			type: 'identifier'
		}, {
			name: 'Variable Source',
			key: 'variableSource',
			type: 'identifier'
		}, {
			name: 'Value',
			key: 'value',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': false
		}],
		transitions: []
	};

	CopyVariableAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.copy(fsm);
		}
	};

	CopyVariableAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.copy(fsm);
		}
	};

	CopyVariableAction.prototype.copy = function (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (this.variableTarget && ownerEntity) {
			try {
				var val;
				if (this.variableSource) {
					val = FsmUtils.getValue(this.variableSource, fsm);
				} else {
					val = FsmUtils.getValue(this.value, fsm);
				}
				ownerEntity[this.variableTarget] = val;
			} catch (err) {
				console.warn(err);
			}
		}
	};

	return CopyVariableAction;
});
var Action = require('goo/fsmpack/statemachine/actions/Action');

	'use strict';

	function GetPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	GetPositionAction.prototype = Object.create(Action.prototype);

	GetPositionAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.entity = settings.entity || null;
		this.variableX = settings.variableX || null;
		this.variableY = settings.variableY || null;
		this.variableZ = settings.variableZ || null;
	};

	GetPositionAction.external = {
		parameters: [{
			name: 'VariableX',
			key: 'variableX',
			type: 'identifier'
		}, {
			name: 'VariableY',
			key: 'variableY',
			type: 'identifier'
		}, {
			name: 'VariableZ',
			key: 'variableZ',
			type: 'identifier'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	GetPositionAction.prototype._run = function (fsm) {
		var translation = this.entity.transformComponent.transform.translation;
		if (this.entity !== null) {
			if (this.variableX) {  // !== undefined
				fsm.applyOnVariable(this.variableX, function () {
					return translation.x;
				});
			}
			if (this.variableY) {
				fsm.applyOnVariable(this.variableY, function () {
					return translation.y;
				});
			}
			if (this.variableZ) {
				fsm.applyOnVariable(this.variableZ, function () {
					return translation.z;
				});
			}
		}
	};

	module.exports = GetPositionAction;
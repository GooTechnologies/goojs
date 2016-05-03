var Action = require('./Action');
var FsmUtils = require('../FsmUtils');

function CopyVariableAction() {
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

CopyVariableAction.prototype.enter = function () {
	if (!this.everyFrame) {
		this.copy();
	}
};

CopyVariableAction.prototype.update = function () {
	if (this.everyFrame) {
		this.copy();
	}
};

CopyVariableAction.prototype.copy = function () {
	var ownerEntity = this.getEntity();
	if (this.variableTarget && ownerEntity) {
		try {
			var val;
			if (this.variableSource) {
				val = this.getValue(this.variableSource);
			} else {
				val = this.getValue(this.value);
			}
			ownerEntity[this.variableTarget] = val;
		} catch (err) {
			console.warn(err);
		}
	}
};

module.exports = CopyVariableAction;
var Action = require('../../../fsmpack/statemachine/actions/Action');

function AddVariableAction() {
	Action.apply(this, arguments);
}

AddVariableAction.prototype = Object.create(Action.prototype);
AddVariableAction.prototype.constructor = AddVariableAction;

AddVariableAction.external = {
	key: 'Add Variable',
	name: 'Add Variable',
	type: 'variables',
	description: '',
	parameters: [{
		name: 'Variable',
		key: 'variable',
		type: 'identifier'
	}, {
		name: 'Amount',
		key: 'amount',
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

AddVariableAction.prototype.add = function () {
	this.applyOnVariable(this.variable, function (v) {
		return v + this.getValue(this.amount);
	}.bind(this));
};

AddVariableAction.prototype.enter = function () {
	if (!this.everyFrame) {
		this.add();
	}
};

AddVariableAction.prototype.update = function () {
	if (this.everyFrame) {
		this.add();
	}
};

module.exports = AddVariableAction;

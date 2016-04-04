var Action = require('../../../fsmpack/statemachine/actions/Action');

function SetCounterAction(/*id, settings*/) {
	Action.apply(this, arguments);
}

SetCounterAction.prototype = Object.create(Action.prototype);
SetCounterAction.prototype.constructor = SetCounterAction;

SetCounterAction.external = {
	key: 'Set Counter',
	name: 'Set Counter',
	type: 'transitions',
	description: 'Sets a counter to a value.',
	parameters: [{
		name: 'Name',
		key: 'name',
		type: 'string',
		description: 'Counter name.'
	}, {
		name: 'Value',
		key: 'value',
		type: 'float',
		description: 'Value to set the counter to.',
		'default': 0
	}],
	transitions: []
};

SetCounterAction.prototype.enter = function (fsm) {
	fsm.getFsm().defineVariable(this.name, +this.value);
};

SetCounterAction.prototype.cleanup = function (fsm) {
	fsm.getFsm().removeVariable(this.name);
};

module.exports = SetCounterAction;
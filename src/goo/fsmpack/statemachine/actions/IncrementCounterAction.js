var Action = require('../../../fsmpack/statemachine/actions/Action');

function IncrementCounterAction() {
	Action.apply(this, arguments);
}

IncrementCounterAction.prototype = Object.create(Action.prototype);
IncrementCounterAction.prototype.constructor = IncrementCounterAction;

IncrementCounterAction.external = {
	key: 'Increment Counter',
	name: 'Increment Counter',
	type: 'transitions',
	description: 'Increments a counter with a value.',
	parameters: [{
		name: 'Name',
		key: 'name',
		type: 'string',
		description: 'Counter name.'
	}, {
		name: 'Increment',
		key: 'increment',
		type: 'float',
		description: 'Value to increment the counter with.',
		'default': 1
	}, {
		name: 'On every frame',
		key: 'everyFrame',
		type: 'boolean',
		description: 'Repeat this action every frame.',
		'default': true
	}],
	transitions: []
};

IncrementCounterAction.prototype.incrementCounter = function () {
	var increment = +this.increment;

	if (this.vars[this.name] === undefined) {
		this.defineVariable(this.name, increment);
		return;
	}

	this.applyOnVariable(this.name, function (oldValue) {
		return oldValue + increment;
	});
};

IncrementCounterAction.prototype.enter = function () {
	if (!this.everyFrame) {
		this.incrementCounter();
	}
};

IncrementCounterAction.prototype.update = function () {
	if (this.everyFrame) {
		this.incrementCounter();
	}
};

IncrementCounterAction.prototype.cleanup = function () {
	this.removeVariable(this.name);
};

module.exports = IncrementCounterAction;
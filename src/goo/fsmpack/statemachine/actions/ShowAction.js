var Action = require('../../../fsmpack/statemachine/actions/Action');

function ShowAction() {
	Action.apply(this, arguments);
}

ShowAction.prototype = Object.create(Action.prototype);
ShowAction.prototype.constructor = ShowAction;

ShowAction.external = {
	key: 'Show',
	name: 'Show',
	type: 'display',
	description: 'Makes an entity visible.',
	parameters: [],
	transitions: []
};

ShowAction.prototype.enter = function () {
	this.getEntity().show();
};

module.exports = ShowAction;
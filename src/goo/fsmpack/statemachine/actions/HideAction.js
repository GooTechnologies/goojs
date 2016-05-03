var Action = require('../../../fsmpack/statemachine/actions/Action');

function HideAction() {
	Action.apply(this, arguments);
}

HideAction.prototype = Object.create(Action.prototype);
HideAction.prototype.constructor = HideAction;

HideAction.external = {
	key: 'Hide',
	name: 'Hide',
	type: 'display',
	description: 'Hides an entity and its children.',
	parameters: [],
	transitions: []
};

HideAction.prototype.enter = function () {
	var entity = this.getEntity();
	entity.hide();
};

module.exports = HideAction;
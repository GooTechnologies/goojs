var Action = require('../../../fsmpack/statemachine/actions/Action');

function RemoveLightAction() {
	Action.apply(this, arguments);
}

RemoveLightAction.prototype = Object.create(Action.prototype);
RemoveLightAction.prototype.constructor = RemoveLightAction;

RemoveLightAction.external = {
	key: 'Remove Light',
	name: 'Remove Light',
	type: 'light',
	description: 'Removes the light attached to the entity.',
	parameters: [],
	transitions: []
};

RemoveLightAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (entity.hasComponent('LightComponent')) {
		entity.clearComponent('LightComponent');
	}
};

module.exports = RemoveLightAction;
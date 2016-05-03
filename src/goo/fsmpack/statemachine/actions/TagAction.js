var Action = require('../../../fsmpack/statemachine/actions/Action');
var ProximityComponent = require('../../../fsmpack/proximity/ProximityComponent');

function TagAction() {
	Action.apply(this, arguments);
}

TagAction.prototype = Object.create(Action.prototype);
TagAction.prototype.constructor = TagAction;

TagAction.external = {
	key: 'Tag',
	name: 'Tag',
	type: 'collision',
	description: 'Sets a tag on the entity. Use tags to be able to capture collision events with the \'Collides\' action.',
	parameters: [{
		name: 'Tag',
		key: 'tag',
		type: 'string',
		control: 'dropdown',
		description: 'Checks for collisions with other objects having this tag.',
		'default': 'red',
		options: ['red', 'blue', 'green', 'yellow']
	}],
	transitions: []
};

TagAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (entity.proximityComponent) {
		if (entity.proximityComponent.tag !== this.tag) {
			entity.clearComponent('ProximityComponent');
			entity.setComponent(new ProximityComponent(this.tag));
		}
	} else {
		entity.setComponent(new ProximityComponent(this.tag));
	}
};

TagAction.prototype.cleanup = function () {
	var entity = this.getEntity();
	if (entity) {
		entity.clearComponent('ProximityComponent');
	}
};

module.exports = TagAction;
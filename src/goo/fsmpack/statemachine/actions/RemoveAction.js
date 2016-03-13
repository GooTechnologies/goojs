var Action = require('../../../fsmpack/statemachine/actions/Action');



	function RemoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveAction.prototype = Object.create(Action.prototype);
	RemoveAction.prototype.constructor = RemoveAction;

	RemoveAction.external = {
		key: 'Remove',
		name: 'Remove',
		type: 'display',
		description: 'Removes the entity from the world.',
		parameters: [{
			name: 'Recursive',
			key: 'recursive',
			type: 'boolean',
			description: 'Remove children too.',
			'default': false
		}],
		transitions: []
	};

	RemoveAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.removeFromWorld(this.recursive);
	};

	module.exports = RemoveAction;
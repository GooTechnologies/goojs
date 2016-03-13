var Action = require('../../../fsmpack/statemachine/actions/Action');



	function HideAction(/*id, settings*/) {
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

	HideAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.hide();
	};

	module.exports = HideAction;
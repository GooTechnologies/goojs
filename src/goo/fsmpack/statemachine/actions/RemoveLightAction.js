import Action from '../../../fsmpack/statemachine/actions/Action';



	function RemoveLightAction(/*id, settings*/) {
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

	RemoveLightAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('LightComponent')) {
			entity.clearComponent('LightComponent');
		}
	};

	export default RemoveLightAction;
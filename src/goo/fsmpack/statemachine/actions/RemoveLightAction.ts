import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class RemoveLightAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Remove Light',
		name: 'Remove Light',
		type: 'light',
		description: 'Removes the light attached to the entity.',
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('LightComponent')) {
			entity.clearComponent('LightComponent');
		}
	};
}

export = RemoveLightAction;
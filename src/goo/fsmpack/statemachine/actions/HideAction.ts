import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class HideAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Hide',
		name: 'Hide',
		type: 'display',
		description: 'Hides an entity and its children.',
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.hide();
	};
}

export = HideAction;
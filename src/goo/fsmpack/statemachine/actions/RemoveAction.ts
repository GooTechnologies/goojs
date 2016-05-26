import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class RemoveAction extends Action {
	recursive: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
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

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.removeFromWorld(this.recursive);
	};
}

export = RemoveAction;
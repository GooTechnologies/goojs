import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class ShowAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Show',
		name: 'Show',
		type: 'display',
		description: 'Makes an entity visible.',
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.show();
	};
}
export = ShowAction;
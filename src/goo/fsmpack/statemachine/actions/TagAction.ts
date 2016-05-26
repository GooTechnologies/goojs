import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var ProximityComponent = require('../../../fsmpack/proximity/ProximityComponent');

class TagAction extends Action {
	tag: string;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
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

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.proximityComponent) {
			if (entity.proximityComponent.tag !== this.tag) {
				entity.clearComponent('ProximityComponent');
				entity.setComponent(new ProximityComponent(this.tag));
			}
		} else {
			entity.setComponent(new ProximityComponent(this.tag));
		}
	};

	cleanup (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity) {
			entity.clearComponent('ProximityComponent');
		}
	};
}

export = TagAction;
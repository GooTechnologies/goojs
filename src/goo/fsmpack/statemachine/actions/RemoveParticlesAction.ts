import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class RemoveParticlesAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Remove Particles',
		name: 'Remove Particles',
		type: 'fx',
		description: 'Removes any particle emitter attached to the entity.',
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.children().each(function (child) {
			if (child.name.indexOf('_ParticleSystem') !== -1 && child.hasComponent('ParticleComponent')) {
				child.removeFromWorld();
			}
		});
	};
}

export = RemoveParticlesAction;
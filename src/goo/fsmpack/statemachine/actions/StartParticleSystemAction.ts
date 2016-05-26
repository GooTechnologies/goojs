import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class StartParticleSystemAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'startParticleSystem',
		name: 'Start Particle System',
		type: 'misc',
		description: 'Starts / plays the particle system on the entity.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.particleSystemComponent) { return; }
		entity.particleSystemComponent.play();
	};
}

export = StartParticleSystemAction;
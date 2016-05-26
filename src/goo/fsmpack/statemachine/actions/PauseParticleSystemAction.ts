import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class PauseParticleSystemAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'pauseParticleSystem',
		name: 'Pause Particle System',
		type: 'misc',
		description: 'Pauses the particle system on the entity.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.particleSystemComponent) { return; }
		entity.particleSystemComponent.pause();
	};
}

export = PauseParticleSystemAction;
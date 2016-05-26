import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class StopParticleSystemAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'stopParticleSystem',
		name: 'Stop Particle System',
		type: 'misc',
		description: 'Stops the particle system on the entity.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.particleSystemComponent) { return; }
		entity.particleSystemComponent.stop();
	};
}

export = StopParticleSystemAction;
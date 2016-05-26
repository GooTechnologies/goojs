import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class UnmuteAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Unmute sounds',
		name: 'Unmute sounds',
		type: 'sound',
		description: 'Unmute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.unmute();
		}
	};
}

export = UnmuteAction;
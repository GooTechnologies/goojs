import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class MuteAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Mute sounds',
		name: 'Mute sounds',
		type: 'sound',
		description: 'Mute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.mute();
		}
	};
}

export = MuteAction;
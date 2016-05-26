import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class ToggleMuteAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Toggle mute sounds',
		name: 'Toggle mute sounds',
		type: 'sound',
		description: 'Toggles mute of all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			if (soundSystem.muted) {
				soundSystem.unmute();
			} else {
				soundSystem.mute();
			}
		}
	};
}

export = ToggleMuteAction;
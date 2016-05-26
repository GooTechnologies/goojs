import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class StopSoundAction extends Action {
	sound: any;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Stop Sound',
		name: 'Stop Sound',
		type: 'sound',
		description: 'Stops a sound.',
		canTransition: false,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to stop.'
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.stop();
			}
		}
	};
}

export = StopSoundAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class PauseSoundAction extends Action {
	sound: any;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Pause Sound',
		name: 'Pause Sound',
		type: 'sound',
		description: 'Pauses a sound.',
		canTransition: false,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to pause.'
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.pause();
			}
		}
	};
}

export = PauseSoundAction;
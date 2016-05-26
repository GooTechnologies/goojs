import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	complete: 'On Sound Fade Out Complete'
};

class SoundFadeOutAction extends Action {
	sound: any;
	time: number;
	constructor(id: string, options: any){
		super(id, options);
	}


	static external: External = {
		key: 'Sound Fade Out',
		name: 'Sound Fade Out',
		type: 'sound',
		description: 'Fades out a sound and stops it.',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to fade out.'
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for the fading to complete.',
			'default': 1000
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the sound fade completes.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.fadeOut(this.time / 1000).then(function () {
					fsm.send(this.transitions.complete);
				}.bind(this));
			}
		}
	};
}

export = SoundFadeOutAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var PromiseUtil = require('../../../util/PromiseUtil');

var labels = {
	complete: 'On Sound Fade In Complete'
};

class SoundFadeInAction extends Action {
	sound: any;
	time: number;
	onSoundEnd: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Sound Fade In',
		name: 'Sound Fade In',
		type: 'sound',
		description: 'Fades in a sound. NOTE: On iOS devices, you need to play the first sound inside a touchend event (for example using the MouseUpAction).',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to fade.'
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for the fading to complete.',
			'default': 1000
		}, {
			name: 'On Sound End',
			key: 'onSoundEnd',
			type: 'boolean',
			description: 'Whether to transition when the sound finishes playing, regardless of the specified transition time.',
			'default': false
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the time expires or when the sound finishes playing.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('SoundComponent')) { return; }

		var sound = entity.soundComponent.getSoundById(this.sound);
		if (!sound) { return; }

		var endPromise;
		try {
			endPromise = sound.fadeIn(this.time / 1000);

			if (this.onSoundEnd) {
				endPromise = sound.play();
			}
		} catch (e) {
			console.warn('Could not play sound: ' + e);
			endPromise = PromiseUtil.resolve();
		}

		endPromise.then(function () {
			fsm.send(this.transitions.complete);
		}.bind(this));
	};
}

export = SoundFadeInAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var PromiseUtil = require('./../../../util/PromiseUtil');

var labels = {
	complete: 'On Sound End'
};

class PlaySoundAction extends Action {
	sound: any;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Play Sound',
		name: 'Play Sound',
		type: 'sound',
		description: 'Plays a sound. NOTE: On iOS devices, you need to play the first sound inside a touchend event (for example using the MouseUpAction).',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to play.'
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the sound finishes playing.'
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
			endPromise = sound.play();
		} catch (e) {
			console.warn('Could not play sound: ' + e);
			endPromise = PromiseUtil.resolve();
		}

		endPromise.then(function () {
			fsm.send(this.transitions.complete);
		}.bind(this));
	};
}

export = PlaySoundAction;
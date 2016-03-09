define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function PauseSoundAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseSoundAction.prototype = Object.create(Action.prototype);
	PauseSoundAction.prototype.constructor = PauseSoundAction;

	PauseSoundAction.external = {
		name: 'Pause Sound',
		type: 'sound',
		description: 'Pauses a sound.',
		canTransition: false,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to pause.',
			'default': 0
		}],
		transitions: []
	};

	PauseSoundAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.pause();
			}
		}
	};

	return PauseSoundAction;
});
define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function StopSoundAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	StopSoundAction.prototype = Object.create(Action.prototype);
	StopSoundAction.prototype.constructor = StopSoundAction;

	StopSoundAction.external = {
		name: 'Stop Sound',
		type: 'sound',
		description: 'Stops a sound.',
		canTransition: false,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}],
		transitions: []
	};

	StopSoundAction.prototype.update = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.stop();
			}
		}
	};

	return StopSoundAction;
});
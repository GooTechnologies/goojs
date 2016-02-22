define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function SoundFadeOutAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SoundFadeOutAction.prototype = Object.create(Action.prototype);
	SoundFadeOutAction.prototype.constructor = SoundFadeOutAction;

	SoundFadeOutAction.external = {
		name: 'Sound Fade Out',
		type: 'sound',
		description: 'Fades out a sound and stops it.',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for the fading to complete',
			'default': 1000
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the movement completes'
		}]
	};

	SoundFadeOutAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.fadeOut(this.time / 1000).then(function () {
					fsm.send(this.transitions.complete);
				}.bind(this));
			}
		}
		// if howler's fade out method is not behaving nice then we can switch to tweening the volume 'manually'
	};

	return SoundFadeOutAction;
});
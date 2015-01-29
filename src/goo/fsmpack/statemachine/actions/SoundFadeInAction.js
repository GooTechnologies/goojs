define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function SoundFadeInAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SoundFadeInAction.prototype = Object.create(Action.prototype);
	SoundFadeInAction.prototype.constructor = SoundFadeInAction;

	SoundFadeInAction.external = {
		name: 'Sound Fade In',
		type: 'sound',
		description: 'Fades in a sound.',
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
			type: 'number',
			description: 'Time it takes for the fading to complete',
			'default': 1000
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the movement completes'
		}]
	};

	SoundFadeInAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.fadeIn(this.time / 1000).then(function() {
					fsm.send(this.transitions.complete);
				}.bind(this));
			}
		}
	};

	return SoundFadeInAction;
});
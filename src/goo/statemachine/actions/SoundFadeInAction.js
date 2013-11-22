define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function SoundFadeInAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SoundFadeInAction.prototype = Object.create(Action.prototype);
	SoundFadeInAction.prototype.constructor = SoundFadeInAction;

	SoundFadeInAction.external = {
		name: 'Sound Fade In',
		descriptions: 'Starts playing a sound',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}, {
			name: 'Time',
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
		if (entity.hasComponent('HowlerComponent')) {
			var sound = entity.howlerComponent.sounds[this.sound];
			if (sound) {
				sound.fadeIn(sound.volume(), this.time, function() {
					fsm.send(this.transitions.complete);
				}.bind(this));
			}
		}
	};

	return SoundFadeInAction;
});
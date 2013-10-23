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
		descriptions: 'Starts playing a sound or increases the volume of an already playing sound',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}, {
			name: 'Volume',
			key: 'volume',
			type: 'number',
			description: 'Target volume',
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
			description: 'Event fired when the movement completes'
		}]
	};

	SoundFadeInAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('HowlerComponent')) {
			entity.howlerComponent.soundFadeIn(this.sound, this.volume, this.time, function() {
				fsm.send(this.transitions.complete);
			}.bind(this));
		}
		// if howler's fade out method is not behaving nice then we can switch to tweening the volume 'manually'
	};

	return SoundFadeInAction;
});
define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function SoundFadeOutAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SoundFadeOutAction.prototype = Object.create(Action.prototype);
	SoundFadeOutAction.prototype.constructor = SoundFadeOutAction;

	SoundFadeOutAction.external = {
		descriptions: 'Fades out a sound or stops it',
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

	SoundFadeOutAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('HowlerComponent')) {
			entity.howlerComponent.soundFadeOut(this.sound, this.volume, this.time, function() {
				fsm.send(this.transitions.complete);
			}.bind(this));
		}
		// if howler's fade out method is not behaving nice then we can switch to tweening the volume 'manually'
	};

	return SoundFadeOutAction;
});
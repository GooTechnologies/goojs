define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/util/PromiseUtil'
], function (
	Action,
	PromiseUtil
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
		description: 'Fades in a sound. NOTE: will not work on iOS devices.',
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
		}, {
			name: 'On Sound End',
			key: 'onSoundEnd',
			type: 'boolean',
			description: 'Whether to transition when the sound finishes playing, regardless of the specified transition time',
			'default': false
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the time expires or when the sound finishes playing'
		}]
	};

	SoundFadeInAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('SoundComponent')) { return; }

		var sound = entity.soundComponent.getSoundById(this.sound);
		if (!sound) { return; }

		var endPromise;
		try {
			endPromise = sound.fadeIn(this.time / 1000, false);

			if (this.onSoundEnd) {
				endPromise = sound.play();
			} else {
				// endPromise = PromiseUtil.delay(null, this.time);
			}
		} catch (e) {
			console.warn('Could not play sound: ' + e);
			endPromise = PromiseUtil.resolve();
		}

		endPromise.then(function () {
			fsm.send(this.transitions.complete);
		}.bind(this));
	};

	return SoundFadeInAction;
});
define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function UnmuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	UnmuteAction.prototype = Object.create(Action.prototype);
	UnmuteAction.prototype.constructor = UnmuteAction;

	UnmuteAction.external = {
		name: 'Toggle mute sounds',
		type: 'sound',
		description: 'Toggles mute of all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	UnmuteAction.prototype.enter = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			if(soundSystem.muted){
				soundSystem.unmute();
			} else {
				soundSystem.mute();
			}
		}
	};

	return UnmuteAction;
});
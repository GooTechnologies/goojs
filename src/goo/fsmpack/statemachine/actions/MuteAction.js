define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function MuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	MuteAction.prototype = Object.create(Action.prototype);
	MuteAction.prototype.constructor = MuteAction;

	MuteAction.external = {
		name: 'Mute sounds',
		type: 'sound',
		description: 'Mute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	MuteAction.prototype._setup = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.mute();
		}
	};

	return MuteAction;
});
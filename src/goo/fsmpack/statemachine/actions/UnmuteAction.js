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
		name: 'Unmute sounds',
		type: 'sound',
		description: 'Unmute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	UnmuteAction.prototype._setup = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.unmute();
		}
	};

	return UnmuteAction;
});
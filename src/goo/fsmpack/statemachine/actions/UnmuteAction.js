var Action = require('./Action');

	function UnmuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	UnmuteAction.prototype = Object.create(Action.prototype);
	UnmuteAction.prototype.constructor = UnmuteAction;

	UnmuteAction.external = {
		key: 'Unmute sounds',
		name: 'Unmute sounds',
		type: 'sound',
		description: 'Unmute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	UnmuteAction.prototype.enter = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.unmute();
		}
	};

	module.exports = UnmuteAction;
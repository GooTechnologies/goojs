var Action = require('./Action');

function UnmuteAction() {
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

UnmuteAction.prototype.enter = function () {
	var world = this.getEntity()._world.time;
	if (!world) { return; }

	var soundSystem = world.getSystem('SoundSystem');
	if (soundSystem) {
		soundSystem.unmute();
	}
};

module.exports = UnmuteAction;
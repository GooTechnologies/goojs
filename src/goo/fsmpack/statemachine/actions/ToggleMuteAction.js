var Action = require('./Action');

function ToggleMuteAction() {
	Action.apply(this, arguments);
}
ToggleMuteAction.prototype = Object.create(Action.prototype);
ToggleMuteAction.prototype.constructor = ToggleMuteAction;

ToggleMuteAction.external = {
	key: 'Toggle mute sounds',
	name: 'Toggle mute sounds',
	type: 'sound',
	description: 'Toggles mute of all sounds globally.',
	canTransition: false,
	parameters: [],
	transitions: []
};

ToggleMuteAction.prototype.enter = function () {
	var world = this.getEntity()._world;
	if (!world) { return; }

	var soundSystem = world.getSystem('SoundSystem');
	if (soundSystem) {
		if (soundSystem.muted) {
			soundSystem.unmute();
		} else {
			soundSystem.mute();
		}
	}
};

module.exports = ToggleMuteAction;
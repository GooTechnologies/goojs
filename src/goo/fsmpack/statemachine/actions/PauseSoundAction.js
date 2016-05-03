var Action = require('./Action');

function PauseSoundAction() {
	Action.apply(this, arguments);
}

PauseSoundAction.prototype = Object.create(Action.prototype);
PauseSoundAction.prototype.constructor = PauseSoundAction;

PauseSoundAction.external = {
	key: 'Pause Sound',
	name: 'Pause Sound',
	type: 'sound',
	description: 'Pauses a sound.',
	canTransition: false,
	parameters: [{
		name: 'Sound',
		key: 'sound',
		type: 'sound',
		description: 'Sound to pause.'
	}],
	transitions: []
};

PauseSoundAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (entity.hasComponent('SoundComponent')) {
		var sound = entity.soundComponent.getSoundById(this.sound);
		if (sound) {
			sound.pause();
		}
	}
};

module.exports = PauseSoundAction;
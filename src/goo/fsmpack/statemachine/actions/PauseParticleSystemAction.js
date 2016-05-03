var Action = require('./Action');

function PauseParticleSystemAction() {
	Action.apply(this, arguments);
}
PauseParticleSystemAction.prototype = Object.create(Action.prototype);
PauseParticleSystemAction.prototype.constructor = PauseParticleSystemAction;

PauseParticleSystemAction.external = {
	key: 'pauseParticleSystem',
	name: 'Pause Particle System',
	type: 'misc',
	description: 'Pauses the particle system on the entity.',
	canTransition: false,
	parameters: [],
	transitions: []
};

PauseParticleSystemAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (!entity || !entity.particleSystemComponent) { return; }
	entity.particleSystemComponent.pause();
};

module.exports = PauseParticleSystemAction;
var Action = require('./Action');

function StartParticleSystemAction() {
	Action.apply(this, arguments);
}
StartParticleSystemAction.prototype = Object.create(Action.prototype);
StartParticleSystemAction.prototype.constructor = StartParticleSystemAction;

StartParticleSystemAction.external = {
	key: 'startParticleSystem',
	name: 'Start Particle System',
	type: 'misc',
	description: 'Starts / plays the particle system on the entity.',
	canTransition: false,
	parameters: [],
	transitions: []
};

StartParticleSystemAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (!entity || !entity.particleSystemComponent) { return; }
	entity.particleSystemComponent.play();
};

module.exports = StartParticleSystemAction;
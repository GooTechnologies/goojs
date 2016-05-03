var Action = require('./Action');

function StopParticleSystemAction() {
	Action.apply(this, arguments);
}
StopParticleSystemAction.prototype = Object.create(Action.prototype);
StopParticleSystemAction.prototype.constructor = StopParticleSystemAction;

StopParticleSystemAction.external = {
	key: 'stopParticleSystem',
	name: 'Stop Particle System',
	type: 'misc',
	description: 'Stops the particle system on the entity.',
	canTransition: false,
	parameters: [],
	transitions: []
};

StopParticleSystemAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (!entity || !entity.particleSystemComponent) { return; }
	entity.particleSystemComponent.stop();
};

module.exports = StopParticleSystemAction;
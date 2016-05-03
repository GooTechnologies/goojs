var Action = require('../../../fsmpack/statemachine/actions/Action');

function RemoveParticlesAction() {
	Action.apply(this, arguments);
}

RemoveParticlesAction.prototype = Object.create(Action.prototype);
RemoveParticlesAction.prototype.constructor = RemoveParticlesAction;

RemoveParticlesAction.external = {
	key: 'Remove Particles',
	name: 'Remove Particles',
	type: 'fx',
	description: 'Removes any particle emitter attached to the entity.',
	parameters: [],
	transitions: []
};

RemoveParticlesAction.prototype.enter = function () {
	var entity = this.getEntity();
	entity.children().each(function (child) {
		if (child.name.indexOf('_ParticleSystem') !== -1 && child.hasComponent('ParticleComponent')) {
			child.removeFromWorld();
		}
	});
};

module.exports = RemoveParticlesAction;
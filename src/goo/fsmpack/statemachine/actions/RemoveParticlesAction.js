define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function RemoveParticlesAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveParticlesAction.prototype = Object.create(Action.prototype);
	RemoveParticlesAction.prototype.constructor = RemoveParticlesAction;

	RemoveParticlesAction.external = {
		name: 'Remove Particles',
		type: 'fx',
		description: 'Removes any particle emitter attached to the entity.',
		parameters: [],
		transitions: []
	};

	RemoveParticlesAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.children().each(function (child) {
			if (child.name.indexOf('_ParticleSystem') !== -1 && child.hasComponent('ParticleComponent')) {
				child.removeFromWorld();
			}
		});
	};

	return RemoveParticlesAction;
});
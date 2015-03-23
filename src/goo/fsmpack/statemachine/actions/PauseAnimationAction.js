define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function PauseAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseAnimationAction.prototype = Object.create(Action.prototype);
	PauseAnimationAction.prototype.constructor = PauseAnimationAction;

	PauseAnimationAction.external = {
		name: 'Pause Animation',
		type: 'animation',
		description: 'Pauses skeleton animations',
		parameters: [{
			name: 'On all entities',
			key: 'onAll',
			type: 'boolean',
			description: 'Pause animation on all entities or just one',
			'default': false
		}],
		transitions: []
	};

	PauseAnimationAction.prototype._run = function(fsm) {
		if (this.onAll) {
			var world = fsm.getWorld();
			var animationSystem = world.getSystem('AnimationSystem');
			animationSystem.pause();
		} else {
			var entity = fsm.getOwnerEntity();
			if (entity.animationComponent) {
				entity.animationComponent.pause();
			}
		}
	};

	return PauseAnimationAction;
});
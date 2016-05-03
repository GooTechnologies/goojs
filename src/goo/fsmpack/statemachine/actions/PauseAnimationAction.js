var Action = require('../../../fsmpack/statemachine/actions/Action');

function PauseAnimationAction() {
	Action.apply(this, arguments);
}

PauseAnimationAction.prototype = Object.create(Action.prototype);
PauseAnimationAction.prototype.constructor = PauseAnimationAction;

PauseAnimationAction.external = {
	key: 'Pause Animation',
	name: 'Pause Animation',
	type: 'animation',
	description: 'Pauses skeleton animations.',
	parameters: [{
		name: 'On all entities',
		key: 'onAll',
		type: 'boolean',
		description: 'Pause animation on all entities or just one.',
		'default': false
	}],
	transitions: []
};

PauseAnimationAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (this.onAll) {
		var world = entity._world;
		var animationSystem = world.getSystem('AnimationSystem');
		animationSystem.pause();
	} else {
		if (entity.animationComponent) {
			entity.animationComponent.pause();
		}
	}
};

module.exports = PauseAnimationAction;
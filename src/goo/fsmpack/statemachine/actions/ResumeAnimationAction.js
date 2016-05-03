var Action = require('../../../fsmpack/statemachine/actions/Action');

function ResumeAnimationAction() {
	Action.apply(this, arguments);
}

ResumeAnimationAction.prototype = Object.create(Action.prototype);
ResumeAnimationAction.prototype.constructor = ResumeAnimationAction;

ResumeAnimationAction.external = {
	key: 'Resume Animation',
	name: 'Resume Animation',
	type: 'animation',
	description: 'Continues playing a skeleton animation.',
	parameters: [{
		name: 'On all entities',
		key: 'onAll',
		type: 'boolean',
		description: 'Resume animation on all entities or just one.',
		'default': false
	}],
	transitions: []
};

ResumeAnimationAction.prototype.enter = function () {
	if (this.onAll) {
		var world = this.getEntity()._world;
		var animationSystem = world.getSystem('AnimationSystem');
		animationSystem.resume();
	} else {
		var entity = this.getEntity();
		if (entity.animationComponent) {
			entity.animationComponent.resume();
		}
	}
};

module.exports = ResumeAnimationAction;
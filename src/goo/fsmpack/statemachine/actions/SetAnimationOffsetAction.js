var Action = require('../../../fsmpack/statemachine/actions/Action');

function SetAnimationOffsetAction(/*id, settings*/) {
	Action.apply(this, arguments);
}

SetAnimationOffsetAction.prototype = Object.create(Action.prototype);
SetAnimationOffsetAction.prototype.constructor = SetAnimationOffsetAction;

SetAnimationOffsetAction.external = {
	key: 'Set Animation Offset',
	name: 'Set Animation Offset',
	type: 'animation',
	description: 'Sets animation offset.',
	parameters: [{
		name: 'Offset',
		key: 'offset',
		type: 'float',
		description: 'Animation offset',
		'default': 0
	}],
	transitions: []
};

SetAnimationOffsetAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	if (entity.animationComponent) {
		entity.animationComponent.shiftClipTime(this.offset);
	}
};

module.exports = SetAnimationOffsetAction;
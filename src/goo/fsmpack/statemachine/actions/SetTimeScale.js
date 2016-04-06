var Action = require('./Action');

function SetTimeScale(/*id, settings*/) {
	Action.apply(this, arguments);
	this.everyFrame = false;
}

SetTimeScale.prototype = Object.create(Action.prototype);
SetTimeScale.prototype.constructor = SetTimeScale;

SetTimeScale.external = {
	key: 'Set Animation Time Scale',
	name: 'Set Animation Time Scale',
	type: 'animation',
	description: 'Sets the time scale for the current animation.',
	parameters: [{
		name: 'Scale',
		key: 'scale',
		type: 'float',
		description: 'Scale factor for the animation timer.',
		'default': 1
	}],
	transitions: []
};

SetTimeScale.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	if (entity.animationComponent) {
		entity.animationComponent.setTimeScale(this.scale);
	}
};

module.exports = SetTimeScale;
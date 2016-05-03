var Action = require('../../../fsmpack/statemachine/actions/Action');

function SetClearColorAction() {
	Action.apply(this, arguments);
}

SetClearColorAction.prototype = Object.create(Action.prototype);
SetClearColorAction.prototype.constructor = SetClearColorAction;

SetClearColorAction.external = {
	key: 'Set Clear Color',
	name: 'Background Color',
	description: 'Sets the clear color.',
	parameters: [{
		name: 'Color',
		key: 'color',
		type: 'vec4',
		control: 'color',
		description: 'Color.',
		'default': [1, 1, 1, 1]
	}],
	transitions: []
};

SetClearColorAction.prototype.enter = function () {
	var entity = this.getEntity();
	var color = this.color;
	entity._world.gooRunner.renderer.setClearColor(color[0], color[1], color[2], color[3]);
};

module.exports = SetClearColorAction;
define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function SetClearColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetClearColorAction.prototype = Object.create(Action.prototype);
	SetClearColorAction.prototype.constructor = SetClearColorAction;

	SetClearColorAction.external = {
		key: 'Set Clear Color',
		name: 'Background Color',
		description: 'Sets the clear color',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Color',
			'default': [1, 1, 1]
		}],
		transitions: []
	};

	SetClearColorAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var color = this.color;
		entity._world.gooRunner.renderer.setClearColor(color[0], color[1], color[2], 1);
	};

	return SetClearColorAction;
});
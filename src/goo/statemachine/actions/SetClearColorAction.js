define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
	) {
	"use strict";

	function SetClearColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetClearColorAction.prototype = Object.create(Action.prototype);
	SetClearColorAction.prototype.constructor = SetClearColorAction;

	SetClearColorAction.external = {
		description: 'Sets the clear color',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'color',
			description: 'Color',
			'default': [1, 1, 1]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': false
		}],
		transitions: []
	};

	SetClearColorAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var goo = entity._world.gooRunner;
		goo.renderer.setClearColor(this.color[0], this.color[1], this.color[2], 1);
	};

	return SetClearColorAction;
});
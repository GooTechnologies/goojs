define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function RemoveLightAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveLightAction.prototype = Object.create(Action.prototype);
	RemoveLightAction.prototype.constructor = RemoveLightAction;

	RemoveLightAction.external = {
		parameters: [],
		transitions: []
	};

	RemoveLightAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		entity.clearComponent('LightComponent');
	};

	return RemoveLightAction;
});
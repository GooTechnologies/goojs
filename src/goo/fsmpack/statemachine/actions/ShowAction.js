define([
	'fsmpack/statemachine/actions/Action',
	'goo/entities/EntityUtils'
],
/** @lends */
function(
	Action,
	EntityUtils
) {
	"use strict";

	function ShowAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ShowAction.prototype = Object.create(Action.prototype);
	ShowAction.prototype.constructor = ShowAction;

	ShowAction.external = {
		name: 'Show',
		description: 'Makes an entity visible',
		parameters: [],
		transitions: []
	};

	ShowAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		EntityUtils.show(entity);
	};

	return ShowAction;
});
define([
	'goo/statemachine/actions/Action',
	'goo/entities/EntityUtils'
],
/** @lends */
function(
	Action,
	EntityUtils
) {
	"use strict";

	function HideAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	HideAction.prototype = Object.create(Action.prototype);
	HideAction.prototype.constructor = HideAction;

	HideAction.external = {
		parameters: [],
		transitions: []
	};

	HideAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		EntityUtils.hide(entity);
	};

	return HideAction;
});
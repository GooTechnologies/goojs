define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function RandomEventAction(settings) {
		settings = settings || {};
	}

	RandomEventAction.prototype = Object.create(Action.prototype);

	RandomEventAction.external = {
		key: ['string', 'Key'],
		event: ['string', 'Send event']
	};

	// not onCreate
	RandomEventAction.prototype.onCreate = function(fsm) {
		var val = Math.floor(Math.random() * state.getEvents().length);
		fsm.handle(state.getEvents()[val]);
	};

	return RandomEventAction;
});
define([
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function RandomEventAction(settings) {
		settings = settings || {};

		// this.external = {
		// 	key: ['string', 'Key'],
		// 	event: ['string', 'Send event']
		// };
	}

	RandomEventAction.prototype = {
		onCreate: function(fsm, state) {
			var val = Math.floor(Math.random() * state.getEvents().length);
			fsm.handle(state.getEvents()[val]);
		}
	};

	Actions.register('RandomEventAction', RandomEventAction);
	return RandomEventAction;
});
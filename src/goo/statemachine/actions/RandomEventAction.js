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
		this.everyFrame = settings.everyFrame || true;
		this.events = settings.events || [];
	}

	RandomEventAction.prototype = Object.create(Action.prototype);

	RandomEventAction.external = [{
			key: ['string', 'Key'],
			event: ['string', 'Send event']
		}];

	RandomEventAction.prototype._run = function(fsm) {
		var val = Math.floor(Math.random() * this.events.length);
		fsm.send(this.events[val]);
	};

	return RandomEventAction;
});
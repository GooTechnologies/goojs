define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function EventListenerAction(settings) {
		settings = settings || {};

		this.eventName = settings.eventName || 'input';
		this.event = settings.event || 'output';
	}

	EventListenerAction.prototype = Object.create(Action.prototype);

	EventListenerAction.external = [
		{
			name: 'Listen To',
			key: 'listen',
			type: 'event'
		},
		{
			name: 'Send Event',
			key: 'event',
			type: 'event'
		}];

	EventListenerAction.prototype.listen = function (data) {
		console.log('cool', data);
	};

	EventListenerAction.prototype._onEnter = function (fsm) {
		fsm.addListener(this.eventName, this.listen);
	};

	EventListenerAction.prototype.exit = function (fsm) {
		fsm.removeListener(this.eventName, this.listen);
	};

	return EventListenerAction;
});
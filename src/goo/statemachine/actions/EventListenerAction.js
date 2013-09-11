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
	function EventListenerAction(settings) {
		settings = settings || {};

		this.eventName = settings.eventName || 'input';
		this.event = settings.event || 'output';

		this.external = [
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
	}

	EventListenerAction.prototype.listen = function (data) {
		console.log('cool', data);
	};

	EventListenerAction.prototype.onEnter = function (fsm) {
		fsm.addListener(this.eventName, this.listen);
	};

	EventListenerAction.prototype.onExit = function (fsm) {
		fsm.removeListener(this.eventName, this.listen);
	};

	Actions.register('EventListenerAction', EventListenerAction);
	return EventListenerAction;
});
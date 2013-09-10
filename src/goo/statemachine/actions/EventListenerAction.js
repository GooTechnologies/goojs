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

		this.listen = settings.listen || 'input';
		this.event = settings.event || 'output';
		this.anotherSub = null;

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

	EventListenerAction.prototype = {
		onCreate: function(/*fsm*/) {
			/*
			if (!this.anotherSub) {
				this.anotherSub = postal.subscribe({
					channel: 'statefsm.events',
					topic: this.listen,
					callback: function(data, envelope) {
						// console.log(state.id);
						// fsm.transition(state.id);
						fsm.handle(this.event);
					}.bind(this)
				});
			}
			*/
		},
		onDestroy: function() {
			this.anotherSub.unsubscribe();
			this.anotherSub = null;
		}
	};

	Actions.register('EventListenerAction', EventListenerAction);
	return EventListenerAction;
});
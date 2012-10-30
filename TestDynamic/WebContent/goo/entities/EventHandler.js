define(function() {
	"use strict";

	/**
	 * @name EventHandler
	 * @class Handles event dispatch/listen
	 */
	function EventHandler() {
	}

	EventHandler.listeners = [];

	EventHandler.dispatch = function() {
		if (arguments.length === 0) {
			throw "Event needs to specify a callback as first argument";
		}

		var callback = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		for ( var i in EventHandler.listeners) {
			var listener = EventHandler.listeners[i];
			if (listener[callback]) {
				listener[callback].apply(null, args);
			}
		}
	};

	EventHandler.addListener = function(listener) {
		if (EventHandler.listeners.indexOf(listener) === -1) {
			EventHandler.listeners.push(listener);
		}
	};

	EventHandler.removeListener = function(listener) {
		var index = EventHandler.listeners.indexOf(listener);
		if (index !== -1) {
			EventHandler.listeners.splice(index, 1);
		}
	};

	return EventHandler;
});

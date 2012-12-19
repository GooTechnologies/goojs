define(function () {
	"use strict";

	/**
	 * @name EventHandler
	 * @class Singleton module for handling event dispatches/listening (TBD: don't do this as a singleton)
	 */
	function EventHandler() {
	}

	EventHandler.listeners = [];

	/**
	 * Sends messages to all listeners with provided callback function.
	 *
	 * @param arguments ([callback function name], arguments...)
	 */
	EventHandler.dispatch = function () {
		if (arguments.length === 0) {
			throw new Error("Event needs to specify a callback as first argument");
		}

		var callback = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i in EventHandler.listeners) {
			var listener = EventHandler.listeners[i];
			if (listener[callback]) {
				listener[callback].apply(null, args);
			}
		}
	};

	/**
	 * Register listener of event dispatches
	 *
	 * @param listener Listener to register
	 */
	EventHandler.addListener = function (listener) {
		if (EventHandler.listeners.indexOf(listener) === -1) {
			EventHandler.listeners.push(listener);
		}
	};

	/**
	 * Remove listener of event dispatches
	 *
	 * @param listener Listener to unregister
	 */
	EventHandler.removeListener = function (listener) {
		var index = EventHandler.listeners.indexOf(listener);
		if (index !== -1) {
			EventHandler.listeners.splice(index, 1);
		}
	};

	return EventHandler;
});

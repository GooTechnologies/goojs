define(function () {
	'use strict';

	/**
	 * A generic event bus. Offers ways to receive and subscribe to messages.
	 */
	function EventBus() {
	}

	/**
	 * Attach EventBus methods to an object
	 * @param  {object} target Target object to attach event bus methods to
	 */
	EventBus.attach = function (target) {
		target.fire = EventBus.prototype.fire;
		target.on = EventBus.prototype.on;
		target.off = EventBus.prototype.off;
		target.has = EventBus.prototype.has;

		// Need to alias like below?
		target.emit = EventBus.prototype.fire;
		target.addListener = EventBus.prototype.on;
		target.removeListener = EventBus.prototype.off;
		target.hasListener = EventBus.prototype.has;

		target.dispatchEvent = EventBus.prototype.fire;
		target.addEventListener = EventBus.prototype.on;
		target.removeEventListener = EventBus.prototype.off;
		target.hasEventListener = EventBus.prototype.has;
	};

	/**
	 * Sends messages to all listeners with provided listener function.
	 *
	 * @param {string} channels channel(s) addressed
	 * @param {*} [data] Data passed to the listeners
	 */
	EventBus.prototype.fire = function (name, data) {
		if (this._listenerMap === undefined) {
			return this;
		}

		var listeners = this._listenerMap.get(name);
		if (listeners) {
			var that = this;
			listeners.forEach(function (listener) {
				listener(that, data);
			});
		}

		return this;
	};

	/**
	 * Add listener
	 * @param {string} name
	 * @param {function} listener function (data)
	 */
	EventBus.prototype.on = function (name, listener) {
		this._listenerMap = this._listenerMap || new Map();

		var listeners = this._listenerMap.get(name);
		if (!listeners) {
			listeners = new Set();
			this._listenerMap.set(name, listeners);
		}
		listeners.add(listener);

		return this;
	};

	/**
	 * Remove listener
	 * @param {string} name
	 * @param {function} listener
	 */
	EventBus.prototype.off = function (name, listener) {
		if (this._listenerMap === undefined) {
			return this;
		}

		var listeners = this._listenerMap.get(name);
		if (listeners) {
			listeners.delete(listener);

			if (listeners.size === 0) {
				this._listenerMap.delete(name);
			}
		}

		return this;
	};

	/**
	 * Test if there are any listeners bound to a certain event name
	 * @param {string} name Name of event to test
	 */
	EventBus.prototype.has = function (name) {
		return this._listenerMap !== undefined && this._listenerMap.has(name);
	};

	return EventBus;
});

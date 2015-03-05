define(function() {
	'use strict';

	/**
	 * EventTarget is implemented by objects that can receive events and may have listeners for them.
	 * @example
	 * function MyObject() {
	 * 		EventTarget.apply(this, arguments);
	 * }
	 * MyObject.prototype = Object.create(EventTarget.prototype);
	 */
	function EventTarget() {
		this._listenerMap = new Map();
	}

	/**
	 * Sends an event to all listeners
	 * @param {Object} event Event passed to the listeners
	 * @returns {EventTarget} Self for chaining.
	 */
	EventTarget.prototype.fire = function (event) {
		var listeners = this._listenerMap.get(event.type);
		if (listeners) {
			event.target = this;

			var listenersCopy = listeners.slice();
			for (var i = 0, l = listenersCopy.length; i < l; i++) {
				listenersCopy[i].call(this, event);
			}
		}

		return this;
	};

	/**
	 * Registers a new listener for a certain event type
	 * @param {string} type Type of event listener to add
	 * @param {function} listener Listener to add
	 * @returns {EventTarget} Self for chaining.
	 */
	EventTarget.prototype.on = function (type, listener) {
		var listeners = this._listenerMap.get(type);
		if (!listeners) {
			listeners = [listener];
			this._listenerMap.set(type, listeners);
		} else if (listeners.indexOf(listener) === -1) {
			listeners.push(listener);
		}

		return this;
	};

	/**
	 * Removes a listener for a certain event type
	 * @param {string} type Type of event listener to remove
	 * @param {function} listener Listener to remove
	 * @returns {EventTarget} Self for chaining.
	 */
	EventTarget.prototype.off = function (type, listener) {
		if (listener) {
			var index;
			var listeners = this._listenerMap.get(type);
			if (listeners && (index = listeners.indexOf(listener)) !== -1) {
				listeners.splice(index, 1);

				if (listeners.length === 0) {
					this._listenerMap.delete(type);
				}
			}
		} else {
			this._listenerMap.delete(type);
		}

		return this;
	};

	/**
	 * Test if there are any listeners bound to a certain event type
	 * @param {string} type Type of event to test for
	 * @returns {boolean} If there are any listeners of specified type on this target
	 */
	EventTarget.prototype.has = function (type) {
		return this._listenerMap.has(type);
	};

	/**
	 * Get all listeners for a certain type
	 * @param {string} type Type of event to get listeners for
	 * @returns {Array} All listeners of specified type attached to this target
	 */
	EventTarget.prototype.get = function (type) {
		return this._listenerMap.get(type);
	};

	return EventTarget;
});
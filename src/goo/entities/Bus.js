define(
	/** @lends */
	function () {
	"use strict";

	function Bus() {
		// rewrite this as a trie-like structure
		this.listeners = [];
	}

	/**
	 * Sends messages to all listeners with provided callback function.
	 *
	 * @param {String | String[]} channel(s) addressed
	 * @param {Object} data
	 */
	Bus.prototype.emit = function (channels, data) {
		if (typeof channels === "string") {
			channels = [channels];
		}

		for (var i = 0; i < channels.length; i++) {
			var channel = channels[i];

			for (var j = 0; j < this.listeners.length; j++) {
				var listener = this.listeners[j];

				if(listener.name.substr(0, channel.length) === channel) {
					listener.callback(data);
				}
			}
		}
	};

	/**
	 * Register callback for a channel
	 * @param {String} channelName
	 */
	Bus.prototype.addListener = function (channelName, callback) {
		// verify if listener is already present on the same channel
		this.listeners.push({ name: channelName, callback: callback });
	};

	/**
	 * Remove a listener from a channel
	 * @param channelName
	 * @param callbackToRemove
	 */
	Bus.prototype.removeListener = function (channelName, callbackToRemove) {
		this.listeners = this.listeners.filter(function(listener) {
			return !(listener.name === channelName && listener.callback === callbackToRemove);
		});
	};

	/**
	 * Removes all listeners on a specific channel
	 * @param channelName
	 */
	Bus.prototype.removeAllOnChannel = function(channelName) {
		this.listeners = this.listeners.filter(function(listener) {
			return listener.name === channelName;
		});
	};

	/**
	 * Removes a listener from all channels
	 */
	Bus.prototype.removeListenerFromAllChannels = function(callbackToRemove) {
		this.listeners = this.listeners.filter(function(listener) {
			return listener.callback !== callbackToRemove;
		});
	};

	return Bus;
});

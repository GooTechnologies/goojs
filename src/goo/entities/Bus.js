define(
	/** @lends */
	function () {
	"use strict";

	function Bus() {
		this.trie = { name: '', listeners: [], children: [] }; // *: { listeners: {name, callback}, children: * }
	}

	function removeFromArray(array, element) {
		var index = array.indexOf(element);
		if (index !== -1) {
			array.splice(index, 1);
		}
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
			this._emitToSingle(channels[i], data);
		}
	};

	Bus.prototype._emitToSingle = function(channelName, data) {
		// this whole bit is common to all
		var node = this.trie;
		var channelPath = channelName.split('.');

		for (var i = 0; i < channelPath.length; i++) {
			var channelSub = channelPath[i];

			// advance to next level
			var advanced = false;
			for (var j = 0; j < node.children.length; j++) {
				if (node.children[j].name === channelSub) {
					node = node.children[j];
					advanced = true;
					break;
				}
			}
			if (!advanced) { return; }
		}
		///

		this._emitToAll(node, data);
	};

	Bus.prototype._emitToAll = function(node, data) {
		for (var i = 0; i < node.listeners.length; i++) {
			node.listeners[i](data);
		}
		for (var i = 0; i < node.children.length; i++) {
			this._emitToAll(node.children[i], data);
		}
	};

	/**
	 * Register callback for a channel
	 * @param {String} channelName
	 */
	Bus.prototype.addListener = function (channelName, callback) {
		var node = this.trie;
		var channelPath = channelName.split('.');

		for (var i = 0; i < channelPath.length; i++) {
			var channelSub = channelPath[i];

			var exists = false;
			for (var j = 0; j < node.children.length; j++) {
				if (node.children[j].name === channelSub) {
					node = node.children[j];
					exists = true;
					break;
				}
			}
			if (!exists) {
				var newNode = { name: channelSub, listeners: [], children: [] };
				node.children.push(newNode);
				node = newNode;
			}
		}

		node.listeners.push(callback);

		// verify if listener is already present on the same channel
	};

	/**
	 * Remove a listener from a channel but not from its children
	 * @param channelName
	 * @param callbackToRemove
	 */
	Bus.prototype.removeListener = function (channelName, callbackToRemove) {
		var node = this.trie;
		var channelPath = channelName.split('.');

		for (var i = 0; i < channelPath.length; i++) {
			var channelSub = channelPath[i];

			var exists = false;
			for (var j = 0; j < node.children.length; j++) {
				if (node.children[j].name === channelSub) {
					node = node.children[j];
					exists = true;
					break;
				}
			}
			if (!exists) { return; }
		}

		removeFromArray(node.listeners, callbackToRemove);
	};

	/**
	 * Removes all listeners on a specific channel
	 * @param channelName
	 */
	Bus.prototype.removeAllOnChannel = function(channelName) {
		var node = this.trie;
		var channelPath = channelName.split('.');

		for (var i = 0; i < channelPath.length; i++) {
			var channelSub = channelPath[i];

			var exists = false;
			for (var j = 0; j < node.children.length; j++) {
				if (node.children[j].name === channelSub) {
					node = node.children[j];
					exists = true;
					break;
				}
			}
			if (!exists) { return; }
		}

		node.listeners = [];
	};

	//Bus.prototype.removeChannel (and children)

	/**
	 * Removes a listener from all channels
	 * @param callbackToRemove
	 */
	Bus.prototype.removeListenerFromAllChannels = function(callbackToRemove) {
		this._remove(this.trie, callbackToRemove);
	};

	Bus.prototype._remove = function(node, callbackToRemove) {
		removeFromArray(node.listeners, callbackToRemove);
		for (var i = 0; i < node.children.length; i++) {
			this._remove(node.children[i], callbackToRemove);
		}
	};

	return Bus;
});

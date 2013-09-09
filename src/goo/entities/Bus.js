define(
	/** @lends */
	function () {
	"use strict";

	function Bus() {
		// REVIEW: Would sure be nice to use objects for children
		this.trie = { name: '', listeners: [], children: [] };
	}

	// REVIEW: How about ArrayUtil.remove?
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

	Bus.prototype._getNode = function(channelName) {
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

		return node;
	};

	Bus.prototype._emitToSingle = function(channelName, data) {
		var node = this._getNode(channelName);
		if(node) { this._emitToAll(node, data); }
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

		if(node.listeners.indexOf(callback) === -1) {
			node.listeners.push(callback);
		}
	};

	/**
	 * Remove a listener from a channel but not from its children
	 * @param channelName
	 * @param callbackToRemove
	 */
	Bus.prototype.removeListener = function (channelName, callbackToRemove) {
		var node = this._getNode(channelName);
		if(node) { removeFromArray(node.listeners, callbackToRemove); }
	};

	/**
	 * Removes all listeners on a specific channel
	 * @param channelName
	 */
	Bus.prototype.removeAllOnChannel = function(channelName) {
		var node = this._getNode(channelName);
		if(node) { node.listeners = []; }
	};

	/**
	 * Removes a channel and its children
	 * @param channelName
	 */
	Bus.prototype.removeChannelAndChildren = function(channelName) {
		var channelParts = channelName.split('.');
		var leafChannelName = channelParts.pop();
		var parentChannelName = channelParts.join('.');
		var parentNode = this._getNode(parentChannelName);

		for (var i = 0; i < parentNode.children.length; i++) {
			if (parentNode.children[i].name === leafChannelName) {
				parentNode.children.splice(i, 1);
				break;
			}
		}
	};

	Bus.prototype._remove = function(node, callbackToRemove) {
		removeFromArray(node.listeners, callbackToRemove);
		for (var i = 0; i < node.children.length; i++) {
			this._remove(node.children[i], callbackToRemove);
		}
	};

	/**
	 * Removes a listener from all channels
	 * @param callbackToRemove
	 */
	Bus.prototype.removeListenerFromAllChannels = function(callbackToRemove) {
		this._remove(this.trie, callbackToRemove);
	};

	return Bus;
});

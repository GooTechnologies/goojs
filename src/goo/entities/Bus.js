define(['goo/util/ArrayUtil'],
	/** @lends */
	function (ArrayUtil) {
	"use strict";

	function Bus() {
		this.trie = { name: '', listeners: [], children: {} };
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

			if(node.children[channelSub]) {
				node = node.children[channelSub];
			} else {
				return;
			}
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

		var childrenKeys = Object.keys(node.children);
		for (var i = 0; i < childrenKeys.length; i++) {
			this._emitToAll(node.children[childrenKeys], data);
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

			if (node.children[channelSub]) {
				node = node.children[channelSub];
			} else {
				var newNode = { listeners: [], children: [] };
				node.children[channelSub] = newNode;
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
		if(node) { ArrayUtil.remove(node.listeners, callbackToRemove); }
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

		delete parentNode.children[leafChannelName];
	};

	Bus.prototype._removeListener = function(node, callbackToRemove) {
		ArrayUtil.remove(node.listeners, callbackToRemove);

		var childrenKeys = Object.keys(node.children);
		for (var i = 0; i < childrenKeys.length; i++) {
			this._removeListener(node.children[childrenKeys[i]], callbackToRemove);
		}
	};

	/**
	 * Removes a listener from all channels
	 * @param callbackToRemove
	 */
	Bus.prototype.removeListenerFromAllChannels = function(callbackToRemove) {
		this._removeListener(this.trie, callbackToRemove);
	};

	return Bus;
});

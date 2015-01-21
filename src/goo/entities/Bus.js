define(function () {
	'use strict';

	/**
	 * A generic message bus. Offers ways to receive and subscribe to messages on a hierarchy of channels.
	 */
	function Bus() {
		this.trie = { name: '', listeners: [], children: new Map() };
	}

	/**
	 * Sends messages to all listeners with provided callback function.
	 *
	 * @param {string | string[]} channels channel(s) addressed
	 * @param {Object} data
	 * @param {boolean} [storeEmit=false] Store the emit data for transmitting to future listeners
	 */
	Bus.prototype.emit = function (channels, data, storeEmit) {
		storeEmit = !!storeEmit;

		if (typeof channels === 'string') {
			channels = [channels];
		}

		for (var i = 0; i < channels.length; i++) {
			this._emitToSingle(channels[i], data, storeEmit);
		}

		return this;
	};

	/**
	 * Retrieves the last message sent on a channel. This will only work if message preservation is enabled when emitting.
	 * @param channel
	 */
	Bus.prototype.getLastMessageOn = function (channelName) {
		var node = this._getNode(channelName);
		if (node) {
			return node.latestData;
		}
	};

	Bus.prototype._getNode = function (channelName, storeEmit) {
		var node = this.trie;
		var channelPath = channelName.split('.');

		for (var i = 0; i < channelPath.length; i++) {
			var channelSub = channelPath[i];

			if (node.children.has(channelSub)) {
				node = node.children.get(channelSub);
			} else {
				if (storeEmit) {
					var newNode = { listeners: [], children: new Map() };
					node.children.set(channelSub, newNode);
					node = newNode;
				} else {
					return;
				}
			}
		}

		return node;
	};

	Bus.prototype._emitToSingle = function (channelName, data, storeEmit) {
		var node = this._getNode(channelName, storeEmit);
		if (node) {
			this._emitToAll(node, data);
			if (storeEmit) {
				node.latestData = data;
			}
		}
	};

	Bus.prototype._emitToAll = function (node, data) {
		for (var i = 0; i < node.listeners.length; i++) {
			var listener = node.listeners[i];
			if (listener) {
				listener(data);
			} else {
				node.listeners.splice(i, 1);
				i--;
			}
		}

		node.children.forEach(function (child) {
			this._emitToAll(child, data);
		}.bind(this));
	};

	/**
	 * Register callback for a channel
	 * @param {String} channelName
	 * @param {Function} callback function (data)
	 * @param {boolean} [retrieveLatestEmit=false] Retrieve the last emit done before this listener was added (if emitted with storeEmit)
	 */
	Bus.prototype.addListener = function (channelName, callback, retrieveLatestEmit) {
		retrieveLatestEmit = !!retrieveLatestEmit;

		var node = this.trie;
		var channelPath = channelName.split('.');

		for (var i = 0; i < channelPath.length; i++) {
			var channelSub = channelPath[i];

			if (node.children.has(channelSub)) {
				node = node.children.get(channelSub);
			} else {
				var newNode = { listeners: [], children: new Map() };
				node.children.set(channelSub, newNode);
				node = newNode;
			}
		}

		if (node.listeners.indexOf(callback) === -1) {
			node.listeners.push(callback);
			if (retrieveLatestEmit && node.latestData) {
				callback(node.latestData);
			}
		}

		return this;
	};

	// why nullfiy and not just splice?
	// because event listeners themselves need to be able to remove listeners
	// maybe JS iterators will solve this issue better
	function nullifyElement(array, element) {
		var index = array.indexOf(element);
		if (index !== -1) {
			array[index] = null;
		}
	}

	/**
	 * Remove a listener from a channel but not from its children
	 * @param channelName
	 * @param callbackToRemove
	 */
	Bus.prototype.removeListener = function (channelName, callbackToRemove) {
		var node = this._getNode(channelName);
		if (node) { nullifyElement(node.listeners, callbackToRemove); }
		return this;
	};

	/**
	 * Removes all listeners on a specific channel
	 * @param channelName
	 */
	Bus.prototype.removeAllOnChannel = function (channelName) {
		var node = this._getNode(channelName);
		if (node) { node.listeners = []; }
		return this;
	};

	/**
	 * Removes a channel and its children
	 * @param channelName
	 */
	Bus.prototype.removeChannelAndChildren = function (channelName) {
		var channelParts = channelName.split('.');

		if (channelParts.length > 1) {
			var leafChannelName = channelParts.pop();
			var parentChannelName = channelParts.join('.');
			var parentNode = this._getNode(parentChannelName);

			parentNode.children.delete(leafChannelName);
		} else {
			this.trie.children.delete(channelName);
		}

		return this;
	};

	Bus.prototype._removeListener = function (node, callbackToRemove) {
		nullifyElement(node.listeners, callbackToRemove);

		node.children.forEach(function (child) {
			this._removeListener(child, callbackToRemove);
		}.bind(this));
	};

	/**
	 * Removes a listener from all channels
	 * @param callbackToRemove
	 */
	Bus.prototype.removeListenerFromAllChannels = function (callbackToRemove) {
		this._removeListener(this.trie, callbackToRemove);
		return this;
	};

	Bus.prototype.clear = function () {
		this.trie = { name: '', listeners: [], children: new Map() };
	};

	return Bus;
});

var AbstractTimelineChannel = require('../timelinepack/AbstractTimelineChannel');

	'use strict';

	function EventChannel(id) {
		AbstractTimelineChannel.call(this, id);

		this.oldTime = 0;
		this.callbackIndex = 0;
	}

	EventChannel.prototype = Object.create(AbstractTimelineChannel.prototype);
	EventChannel.prototype.constructor = AbstractTimelineChannel;

	/**
	 * Add a callback to be called at a specific point in time
	 * @param {string} id
	 * @param {number} time
	 * @param {Function} callback
	 */
	EventChannel.prototype.addCallback = function (id, time, callback) {
		var newCallback = {
			id: id,
			time: time,
			callback: callback
		};

		if (time > this.lastTime) {
			this.keyframes.push(newCallback);
			this.lastTime = time;
		} else if (!this.keyframes.length || time < this.keyframes[0].time) {
			this.keyframes.unshift(newCallback);
		} else {
			var index = this._find(this.keyframes, time) + 1;
			this.keyframes.splice(index, 0, newCallback);
		}

		return this;
	};

	/**
	 * Update the channel
	 * @param time
	 */
	EventChannel.prototype.update = function (time) {
		if (!this.enabled) { return this; }
		if (!this.keyframes.length) { return this; }

		// loop
		if (time < this.oldTime) {
			while (this.callbackIndex < this.keyframes.length) {
				this.keyframes[this.callbackIndex].callback();
				this.callbackIndex++;
			}
			this.callbackIndex = 0;
		}

		while (this.callbackIndex < this.keyframes.length && time > this.keyframes[this.callbackIndex].time) {
			this.keyframes[this.callbackIndex].callback();
			this.callbackIndex++;
		}

		this.oldTime = time;

		return this;
	};

	/**
	 * No events need be fired when scrubbing the timeline
	 * @private
	 * @param time
	 */
	EventChannel.prototype.setTime = function (time) {
		if (!this.enabled) { return this; }
		if (!this.keyframes.length) { return this; }

		if (time <= this.keyframes[0].time) {
			this.callbackIndex = 0;
		} else {
			this.callbackIndex = this._find(this.keyframes, time) + 1;
		}

		this.oldTime = time;

		return this;
	};

	module.exports = EventChannel;
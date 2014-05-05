define([
	'goo/timelinepack/AbstractTimelineChannel'
], function (
	AbstractTimelineChannel
	) {
	'use strict';

	function EventChannel(id) {
		AbstractTimelineChannel.call(this, id);

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
	};

	/**
	 * Update the channel,
	 * @param time
	 */
	EventChannel.prototype.update = function (time, skipCallback) {
		if (!this.enabled) { return; }
		if (!this.keyframes.length) { return; }
		var currentKeyframe = this.keyframes[this.callbackIndex];
		if (!currentKeyframe) {
			currentKeyframe = this.keyframes[this.keyframes.length - 1];
		}
		if (time < this.keyframes[0].time) {
			// Reset event channel
			this.callbackIndex = 0;
			return;
		} else if (time < currentKeyframe.time) {
			this.callbackIndex = this._find(this.keyframes, time) + 1;
		} else if (this.callbackIndex > this.keyframes.length - 1) {
			return;
		}
		if (skipCallback) { return; }

		while (this.callbackIndex < this.keyframes.length && time > this.keyframes[this.callbackIndex].time) {
			this.keyframes[this.callbackIndex].callback();
			this.callbackIndex++;
		}
	};

	return EventChannel;
});
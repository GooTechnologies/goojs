define([], function () {
	'use strict';


	// REVIEW: This and ValueChannel contans a lot of duplicated code. Maybe a single class with different type args, or an abstract parent?
	// Either this could be the base class and ValueChannel could be the child, since this doesn't seem to contain any event-specific functionality
	// Then of course you'd change the name
	// Or you'd move some specific functionality in here and find some other way of sharing the duplicated functionality.

	function EventChannel(id) {
		this.id = id;
		this.enabled = true;

		this.keyframes = [];
		this.callbackIndex = 0;
		this.lastTime = 0;
	}

	/**
	 * Searching for the entry that is previous to the given time
	 * @param sortedArray
	 * @param time
	 * @param lastTime
	 */
	//! AT: could convert into a more general ArrayUtil.pluck and binary search but that creates extra arrays
	function find(sortedArray, time) {
		var start = 0;
		var end = sortedArray.length - 1;
		var lastTime = sortedArray[sortedArray.length - 1].time;

		if (time > lastTime) { return end; }

		while (end - start > 1) {
			var mid = Math.floor((end + start) / 2);
			var midTime = sortedArray[mid].time;

			if (time > midTime) {
				start = mid;
			} else {
				end = mid;
			}
		}

		return start;
	}

	/**
	 * Called only when mutating the start times of entries to be sure that the order is kept
	 * @private
	 */
	EventChannel.prototype.sort = function () {
		this.keyframes.sort(function (a, b) {
			return a.time - b.time;
		});
		this.lastTime = this.keyframes[this.keyframes.length - 1].time;
	};

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
			var index = find(this.keyframes, time) + 1;
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
			this.callbackIndex = find(this.keyframes, time) + 1;
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
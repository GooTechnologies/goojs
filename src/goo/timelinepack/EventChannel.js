define([], function () {
	'use strict';

	function EventChannel(id) {
		this.id = id;
		this.time = 0;

		this.callbackAgenda = [];
		this.callbackIndex = 0;
		this.lastCallbackTime = 0;
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
		this.callbackAgenda.sort(function (a, b) {
			return a.time - b.time;
		});
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

		if (time > this.lastCallbackTime) {
			this.callbackAgenda.push(newCallback);
			this.lastCallbackTime = time;
		} else if (!this.callbackAgenda.length || time < this.callbackAgenda[0].time) {
			this.callbackAgenda.unshift(newCallback);
		} else {
			var index = find(this.callbackAgenda, time) + 1;
			this.callbackAgenda.splice(index, 0, newCallback);
		}
	};

	/**
	 * Executes any callbacks that are scheduled before the current point in time
	 * @private
	 */
	EventChannel.prototype._checkCallbacks = function () {
		while (this.callbackIndex < this.callbackAgenda.length && this.time > this.callbackAgenda[this.callbackIndex].time) {
			this.callbackAgenda[this.callbackIndex].callback();
			this.callbackIndex++;
		}
	};

	/**
	 * Sets the time
	 * @param time
	 */
	EventChannel.prototype.setTime = function (time) {
		this.time = time;
		this.callbackIndex = find(this.callbackAgenda, this.time, this.lastTime);
		this.update(0);
	};


	/**
	 * Update the channel,
	 * @param tpf
	 */
	EventChannel.prototype.update = function (tpf) {
		this.time += tpf;

		// redo looping

		// tmp hack
		// if (this.time > this.lastTime && this.lastTime > 0) {
		// 	this.time %= this.lastTime;
		// 	// REVIEW No callbackend from handler
		// 	if (this.callbackEnd) {
		// 		this.callbackEnd();
		// 	}
		// 	// REVIEW Need to reset callbackIndex, this might be the easiest way
		// 	return this.setTime(this.time);
		// }

		this._checkCallbacks();
	};

	EventChannel.getScaleZTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.scale.z = value;
			entity.transformComponent.setUpdated();
		};
	};

	return EventChannel;
});
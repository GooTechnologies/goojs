define([
	'goo/math/MathUtils'
], function (
	MathUtils
) {
	'use strict';
	// REVIEW Would be nice to separate in TriggerChannel and ValueChannel

	function Channel(id, options) {
		this.id = id;
		this.keyframes = [];
		this.time = 0;
		this.lastTime = 0;
		this.value = 0;

		this.callbackAgenda = [];
		this.callbackIndex = 0;
		this.lastCallbackTime = 0;

		options = options || {};
		this.callbackUpdate = options.callbackUpdate;
		this.callbackEnd = options.callbackEnd;
	}

	/**
	 * Searching for the entry that is previous to the given time
	 * @param sortedArray
	 * @param time
	 * @param lastTime
	 */
	//! AT: could convert into a more general ArrayUtil.pluck and binary search but that creates extra arrays
	// REVIEW lastTime is given by sortedArray[sortedArray.length-1].time
	function find(sortedArray, time, lastTime) {
		var start = 0;
		var end = sortedArray.length - 1;

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
	Channel.prototype.sort = function () {
		// REVIEW a.time - b.time
		this.keyframes.sort(function (a, b) { return a.time - b.time; });
		this.callbackAgenda.sort(function (a, b) { return a.time < b.time; });
	};

	/**
	 * Add a callback to be called at a specific point in time
	 * @param {string} id
	 * @param {number} time
	 * @param {Function} callback
	 */
	//! AT: it looks like code duplication, but the alternative is a generalzilla
	Channel.prototype.addCallback = function (id, time, callback) {
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
			var index = find(this.callbackAgenda, time, this.lastCallbackTime) + 1;
			this.callbackAgenda.splice(index, 0, newCallback);
		}
	};

	/**
	 * Schedules a tween
	 * @param time Start time
	 * @param value
	 * @param {'linear' | 'quadratic' | 'exponential'} easing Type of easing
	 * @param [callback] Callback to call when point was passed
	 */
	Channel.prototype.addKeyframe = function (id, time, value, easing, callback) {
		// insert at correct index

		var newKeyframe = {
			id: id,
			time: time,
			value: value,
			easingFunction: easing//,
			//callback: callback //! AT: probably not used
		};

		if (time > this.lastTime) {
			this.keyframes.push(newKeyframe);
			this.lastTime = time;
		} else if (!this.keyframes.length || time < this.keyframes[0].time) {
			this.keyframes.unshift(newKeyframe);
		} else {
			var index = find(this.keyframes, time, this.lastTime) + 1;
			this.keyframes.splice(index, 0, newKeyframe);
		}

		if (callback) {
			this.addCallback(id, time, callback);
		}
	};

	/**
	 * Executes any callbacks that are scheduled before the current point in time
	 */
	Channel.prototype._checkCallbacks = function () {
		while (this.callbackIndex < this.callbackAgenda.length && this.time > this.callbackAgenda[this.callbackIndex].time) {
			this.callbackAgenda[this.callbackIndex].callback();
			this.callbackIndex++;
		}
	};

	/**
	 * Sets the time
	 * @param time
	 */
	Channel.prototype.setTime = function (time) {
		this.time = time;
		this.callbackIndex = find(this.callbackAgenda, this.time, this.lastTime);
		return this.update(0);
	};


	/**
	 * Update the channel,
	 * @param tpf
	 */
	Channel.prototype.update = function (tpf) {
		if (this.keyframes.length === 0) { return; }
		this.time += tpf;

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

		// run update callback on current position
		// REVIEW This could be moved to the 'else'
		var newEntryIndex = find(this.keyframes, this.time, this.lastTime);
		var newEntry = this.keyframes[newEntryIndex];


		var newValue;
		if (this.time <= this.keyframes[0].time) {
			newValue = this.keyframes[0].value;
		} else if (this.time >= this.lastTime) {
			newValue = this.keyframes[this.keyframes.length - 1].value;
		} else {
			var nextEntry = this.keyframes[newEntryIndex + 1];

			if (nextEntry) {
				var progressInEntry = (this.time - newEntry.time) / (nextEntry.time - newEntry.time);
				var progressValue = newEntry.easingFunction(progressInEntry);
				newValue = MathUtils.lerp(progressValue, newEntry.value, nextEntry.value);
			} else {
				newValue = newEntry.value;
			}
		}

		//! AT: comparing floats with === is ok here
		if (this.value !== newValue || true) { // overriding for now to get time progression
			this.value = newValue;
			// REVIEW There's no callbackupdate from handlers
			this.callbackUpdate(this.time, this.value, newEntryIndex);
		}
		return this.value;
	};

	// REVIEW Should probably be somewhere else
	// tween factories
	Channel.getTranslationXTweener = function (entity) {
		return function (time, value) {
			// REVIEW Use .data[0]
			entity.transformComponent.transform.translation.x = value;
			entity.transformComponent.setUpdated();
		};
	};

	Channel.getTranslationYTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.translation.y = value;
			entity.transformComponent.setUpdated();
		};
	};

	Channel.getTranslationZTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.translation.z = value;
			entity.transformComponent.setUpdated();
		};
	};

	Channel.getScaleXTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.scale.x = value;
			entity.transformComponent.setUpdated();
		};
	};

	Channel.getScaleYTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.scale.y = value;
			entity.transformComponent.setUpdated();
		};
	};

	Channel.getScaleZTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.scale.z = value;
			entity.transformComponent.setUpdated();
		};
	};

	return Channel;
});
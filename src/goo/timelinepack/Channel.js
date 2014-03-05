define([], function () {
	'use strict';

	function Channel() {
		this.entries = [];
		this.time = 0;
		this.lastTime = 0;
		this.value = 0;
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
	function find(sortedArray, time, lastTime) {
		var start = 0;
		var end = sortedArray.length - 1;

		if (time > lastTime) { return end; }

		while (end - start > 1) {
			var mid = Math.floor((end + start) / 2);
			var midTime = sortedArray[mid].start;

			if (time > midTime) {
				start = mid;
			} else {
				end = mid;
			}
		}

		return start;
	}

	Channel.prototype.within = function (index, time) {
		var entry = this.entries[index];
		return entry.start < time && entry.start + entry.length > time;
	};

	//! AT: it looks like code duplication, but the alternative is a generalzilla
	Channel.prototype.addCallback = function (start, callback) {
		var newCallback = {
			start: start,
			callback: callback
		};

		if (start > this.lastCallbackTime) {
			this.callbackAgenda.push(newCallback);
			this.lastCallbackTime = start;
		} else if (!this.callbackAgenda.length || start < this.callbackAgenda[0].start) {
			this.callbackAgenda.unshift(newCallback);
		} else {
			var index = find(this.callbackAgenda, start, this.lastCallbackTime) + 1;
			this.callbackAgenda.splice(index, 0, newCallback);
		}
	};

	/**
	 * Schedules a tween
	 * @param start Start time
	 * @param length Length of the tween
	 * @param valueStart Starting value
	 * @param valueEnd End value
	 * @param {'linear' | 'quadratic' | 'exponential'} easing Type of easing
	 * @param {function(number, number)} [callbackUpdate]
	 * @param [callbackStart] Callback to call when tween was entered
	 * @param [callbackEnd] Callback to call when tween was exited
	 */
	Channel.prototype.addEntry = function (start, length, valueStart, valueEnd, easing, callbackUpdate, callbackStart, callbackEnd) {
		// insert at correct index

		// should also check for conflicts?

		var newEntry = {
			start: start,
			length: length,
			valueStart: valueStart,
			valueEnd: valueEnd,
			//easing: easing,
			//easingFunction: function (v) { return v; }, // identity function for now
			easingFunction: easing,
			callbackUpdate: callbackUpdate
		};

		if (start > this.lastTime) {
			this.entries.push(newEntry);
			this.lastTime = start;
		} else if (!this.entries.length || start < this.entries[0].start) {
			this.entries.unshift(newEntry);
		} else {
			var index = find(this.entries, start, this.lastTime) + 1;
			this.entries.splice(index, 0, newEntry);
		}

		if (callbackStart) { this.addCallback(start, callbackStart); console.log('add start', start); }
		if (callbackEnd) { this.addCallback(start + length, callbackEnd); console.log('add end', start + length);  }
	};

	/**
	 * Executes any callbacks that are scheduled before the current point in time
	 */
	Channel.prototype._checkCallbacks = function () {
		while (this.callbackIndex < this.callbackAgenda.length && this.time > this.callbackAgenda[this.callbackIndex].start) {
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
		this.update(0);
	};

	/**
	 * Update the channel,
	 * @param tpf
	 */
	Channel.prototype.update = function (tpf) {
		this.time += tpf;

		this._checkCallbacks();

		// run update callback on current position
		var newEntryIndex = find(this.entries, this.time, this.lastTime);
		var newEntry = this.entries[newEntryIndex];
		var progressInEntry = (this.time - newEntry.start) / newEntry.length;

		var progressValue;
		if (this.time <= this.entries[0].start) {
			progressValue = 0;
		} else if (this.within(newEntryIndex, this.time)) {
			progressValue = newEntry.easingFunction(progressInEntry);
		} else {
			progressValue = 1;
		}

		//var newValue = newEntry.valueStart * (1 - progressValue) + newEntry.valueEnd * progressValue;

		//! AT: one less multiplication
		var newValue = newEntry.valueStart + (newEntry.valueEnd - newEntry.valueStart) * progressValue;

		//! AT: comparing floats with === is ok here
		if (this.value !== newValue || true) { // overriding for now to see time progression
			this.value = newValue;
			newEntry.callbackUpdate(this.time, this.value, newEntryIndex);
		}
	};

	// tween factories
	Channel.getTranslationXTweener = function (entity) {
		return function (time, value) {
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
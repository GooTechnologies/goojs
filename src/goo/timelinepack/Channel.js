define([], function () {
	'use strict';

	function Channel(options) {
		this.entries = [];
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
	 * @param value
	 * @param {'linear' | 'quadratic' | 'exponential'} easing Type of easing
	 * @param [callback] Callback to call when point was passed
	 */
	Channel.prototype.addEntry = function (start, value, easing, callback) {
		// insert at correct index

		var newEntry = {
			start: start,
			value: value,
			easingFunction: easing,
			callback: callback
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

		if (callback) { this.addCallback(start, callback); console.log('add callback', start); }
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

		// tmp hack
		if (this.time > this.lastTime) {
			this.time %= this.lastTime;
			this.callbackEnd();
		}

		this._checkCallbacks();

		// run update callback on current position
		var newEntryIndex = find(this.entries, this.time, this.lastTime);
		var newEntry = this.entries[newEntryIndex];


		var newValue;
		if (this.time <= this.entries[0].start) {
			newValue = this.entries[0].value;
		} else if (this.time >= this.lastTime) {
			newValue = this.entries[this.entries.length - 1].value;
		} else {
			var nextEntry = this.entries[newEntryIndex + 1];
			var progressInEntry = (this.time - newEntry.start) / (nextEntry.start - newEntry.start);
			var progressValue = newEntry.easingFunction(progressInEntry);

			newValue = newEntry.value + (nextEntry.value - newEntry.value) * progressValue;
		}

		//! AT: comparing floats with === is ok here
		if (this.value !== newValue || true) { // overriding for now to get time progression
			this.value = newValue;
			this.callbackUpdate(this.time, this.value, newEntryIndex);
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
define([], function () {
	'use strict';
	// REVIEW Would be nice to separate in TriggerChannel and ValueChannel

	function ValueChannel(id, options) {
		this.id = id;
		this.keyframes = [];
		this.time = 0;
		this.lastTime = 0;
		this.value = 0;

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
	ValueChannel.prototype.sort = function () {
		this.keyframes.sort(function (a, b) {
			return a.time - b.time;
		});
		this.lastTime = this.keyframes[this.keyframes.length - 1].time;
	};

	/**
	 * Schedules a tween
	 * @param id
	 * @param time Start time
	 * @param value
	 * @param {function(number)} easingFunction
	 */
	ValueChannel.prototype.addKeyframe = function (id, time, value, easingFunction) {
		var newKeyframe = {
			id: id,
			time: time,
			value: value,
			easingFunction: easingFunction
		};

		if (time > this.lastTime) {
			this.keyframes.push(newKeyframe);
			this.lastTime = time;
		} else if (!this.keyframes.length || time < this.keyframes[0].time) {
			this.keyframes.unshift(newKeyframe);
		} else {
			var index = find(this.keyframes, time) + 1;
			this.keyframes.splice(index, 0, newKeyframe);
		}
	};

	/**
	 * Sets the time
	 * @param time
	 */
	ValueChannel.prototype.setTime = function (time) {
		this.time = time;
		this.update(0);
	};


	/**
	 * Update the channel,
	 * @param tpf
	 */
	ValueChannel.prototype.update = function (tpf) {
		this.time += tpf;

		// redo looping

		// tmp hack
		// if (this.time > this.lastTime && this.lastTime > 0) {
		// 	this.time %= this.lastTime;
		// 	if (this.callbackEnd) {
		// 		this.callbackEnd();
		// 	}
		// 	// REVIEW Need to reset callbackIndex, this might be the easiest way
		// 	return this.setTime(this.time);
		// }

		// run update callback on current position
		// REVIEW This could be moved to the 'else'
		var newEntryIndex = find(this.keyframes, this.time);
		var newEntry = this.keyframes[newEntryIndex];

		var newValue;
		if (this.time <= this.keyframes[0].time) {
			newValue = this.keyframes[0].value;
		} else if (this.time >= this.lastTime) {
			newValue = this.keyframes[this.keyframes.length - 1].value;
		} else {
			var nextEntry = this.keyframes[newEntryIndex + 1];
			var progressInEntry = (this.time - newEntry.time) / (nextEntry.time - newEntry.time);
			var progressValue = newEntry.easingFunction(progressInEntry);

			// REVIEW MathUtils.lerp
			newValue = newEntry.value + (nextEntry.value - newEntry.value) * progressValue;
		}

		//! AT: comparing floats with === is ok here
		if (this.value !== newValue || true) { // overriding for now to get time progression
			this.value = newValue;
			this.callbackUpdate(this.time, this.value, newEntryIndex);
		}
	};

	// REVIEW Should probably be somewhere else
	// tween factories
	ValueChannel.getTranslationXTweener = function (entity) {
		return function (time, value) {
			// REVIEW Use .data[0]
			entity.transformComponent.transform.translation.x = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getTranslationYTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.translation.y = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getTranslationZTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.translation.z = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getScaleXTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.scale.x = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getScaleYTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.scale.y = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getScaleZTweener = function (entity) {
		return function (time, value) {
			entity.transformComponent.transform.scale.z = value;
			entity.transformComponent.setUpdated();
		};
	};

	return ValueChannel;
});
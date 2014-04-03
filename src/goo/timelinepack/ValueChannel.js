define([
	'goo/math/Vector3'
], function (
	Vector3
	) {
	'use strict';
	// REVIEW Would be nice to separate in TriggerChannel and ValueChannel

	function ValueChannel(id, options) {
		this.id = id;
		this.keyframes = [];
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
	 * Update the channel,
	 * @param tpf
	 */
	ValueChannel.prototype.update = function (time) {
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
		var newValue;
		var newEntryIndex;
		if (time <= this.keyframes[0].time) {
			newValue = this.keyframes[0].value;
		} else if (time >= this.lastTime) {
			newValue = this.keyframes[this.keyframes.length - 1].value;
		} else {
			newEntryIndex = find(this.keyframes, time);
			var newEntry = this.keyframes[newEntryIndex];
			var nextEntry = this.keyframes[newEntryIndex + 1];

			if (nextEntry) {
				var progressInEntry = (time - newEntry.time) / (nextEntry.time - newEntry.time);
				var progressValue = newEntry.easingFunction(progressInEntry);

				// REVIEW MathUtils.lerp
				newValue = newEntry.value + (nextEntry.value - newEntry.value) * progressValue;
			} else {
				newValue = newEntry.value;
			}
		}

		//! AT: comparing floats with === is ok here
		if (this.value !== newValue || true) { // overriding for now to get time progression
			this.value = newValue;
			this.callbackUpdate(time, this.value, newEntryIndex);
		}
		return newValue;
	};

	/*
	function memoize(fun) {
		var entity;
		return function (entityId) {
			return entity || (entity = fun(entityId));
		};
	}
	*/

	// REVIEW Should probably be somewhere else
	// tween factories
	ValueChannel.getTranslationXTweener = function (entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }
			entity.transformComponent.transform.translation.data[0] = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getTranslationYTweener = function (entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }
			entity.transformComponent.transform.translation.data[1] = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getTranslationZTweener = function (entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }
			entity.transformComponent.transform.translation.data[2] = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getRotationXTweener = function (entityId, resolver) {
		var entity;
		var angles = new Vector3();
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }

			entity.transformComponent.transform.rotation.toAngles(angles);
			angles.data[0] = value;
			entity.transformComponent.transform.rotation.fromAngles(angles.data[0], angles.data[1], angles.data[2]);
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getRotationYTweener = function (entityId, resolver) {
		var entity;
		var angles = new Vector3();
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }

			entity.transformComponent.transform.rotation.toAngles(angles);
			angles.data[1] = value;
			entity.transformComponent.transform.rotation.fromAngles(angles.data[0], angles.data[1], angles.data[2]);
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getRotationZTweener = function (entityId, resolver) {
		var entity;
		var angles = new Vector3();
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }

			entity.transformComponent.transform.rotation.toAngles(angles);
			angles.data[2] = value;
			entity.transformComponent.transform.rotation.fromAngles(angles.data[0], angles.data[1], angles.data[2]);
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getScaleXTweener = function (entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }
			entity.transformComponent.transform.scale.data[0] = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getScaleYTweener = function (entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }
			entity.transformComponent.transform.scale.data[1] = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getScaleZTweener = function (entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }
			entity.transformComponent.transform.scale.data[2] = value;
			entity.transformComponent.setUpdated();
		};
	};

	return ValueChannel;
});
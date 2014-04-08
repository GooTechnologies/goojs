define([
//	'goo/math/Vector3'
], function (
//	Vector3
	) {
	'use strict';

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
	 * @param time
	 */
	ValueChannel.prototype.update = function (time) {
		// run update callback on current position
		if (!this.keyframes.length) {
			return;
		}
		var newValue;
		var newEntryIndex;
		if (time <= this.keyframes[0].time) {
			newValue = this.keyframes[0].value;
		} else if (time >= this.keyframes[this.keyframes.length - 1].time) {
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

	// tween factories
	ValueChannel.getSimpleTransformTweener = function (type, dimensionIndex, entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }

			entity.transformComponent.transform[type].data[dimensionIndex] = value;
			entity.transformComponent.setUpdated();
		};
	};

	ValueChannel.getRotationTweener = function(angleIndex, entityId, resolver, rotation) {
		var entity;
		var degToRad = Math.PI / 180;
		var func = function(time, value) {
			if (!entity) { entity = resolver(entityId); }
			var rotation = func.rotation;
			rotation[angleIndex] = value * degToRad;
			entity.transformComponent.transform.rotation.fromAngles(rotation[0], rotation[1], rotation[2]);
			entity.transformComponent.setUpdated();
		};
		func.rotation = rotation;
		return func;
	};

	/* Unstable and probably very slow
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
	*/

	return ValueChannel;
});
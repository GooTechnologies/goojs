import AbstractTimelineChannel from '../timelinepack/AbstractTimelineChannel';
import MathUtils from '../math/MathUtils';



	function ValueChannel(id, options) {
		AbstractTimelineChannel.call(this, id);

		this.value = 0;

		options = options || {};
		this.callbackUpdate = options.callbackUpdate;
		this.callbackEnd = options.callbackEnd;
	}

	ValueChannel.prototype = Object.create(AbstractTimelineChannel.prototype);
	ValueChannel.prototype.constructor = ValueChannel;

	/**
	 * Schedules a tween
	 * @param id
	 * @param time Start time
	 * @param value
	 * @param {function (number)} easingFunction
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
			var index = this._find(this.keyframes, time) + 1;
			this.keyframes.splice(index, 0, newKeyframe);
		}

		return this;
	};

	/**
	 * Update the channel to a given time.
	 * @param time
	 */
	ValueChannel.prototype.update = function (time) {
		if (!this.enabled) { return this.value; }
		if (!this.keyframes.length) { return this.value; }

		var newValue;
		var newEntryIndex;
		if (time <= this.keyframes[0].time) {
			newValue = this.keyframes[0].value;
		} else if (time >= this.keyframes[this.keyframes.length - 1].time) {
			newValue = this.keyframes[this.keyframes.length - 1].value;
		} else {
			newEntryIndex = this._find(this.keyframes, time);
			var newEntry = this.keyframes[newEntryIndex];
			var nextEntry = this.keyframes[newEntryIndex + 1];

			var progressInEntry = (time - newEntry.time) / (nextEntry.time - newEntry.time);
			var progressValue = newEntry.easingFunction(progressInEntry);

			newValue = MathUtils.lerp(progressValue, newEntry.value, nextEntry.value);
		}

		//! AT: comparing floats with === is ok here
		// if (this.value !== newValue || true) { // overriding for now to get time progression
		//! AT: not sure if create people want this all the time or not
		this.value = newValue;
		this.callbackUpdate(time, this.value, newEntryIndex);
		// }

		return this;
	};

	ValueChannel.prototype.setTime = ValueChannel.prototype.update;

	// tween factories
	ValueChannel.getSimpleTransformTweener = function (type, vectorComponent, entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }

			//
			// REVIEW:
			// what about a guard instead?
			// if (!entity) { return; }
			// I used to be pro-guard as it reduces indentation, but is it easier to read..?
			//

			//! AT: this prevents the timeline from blowing up if the entity is absent
			// it's a temporary fix in the engine until the issue is patched in create
			// https://trello.com/c/cj8XQnUz/1588-normal-user-can-t-import-prefabs-with-timelines-if-not-all-animated-objects-are-in-the-prefab
			if (entity) {
				entity.transformComponent.transform[type][vectorComponent] = value;
				entity.transformComponent.setUpdated();
			}
		};
	};

	ValueChannel.getRotationTweener = function (angleIndex, entityId, resolver, rotation) {
		var entity;
		var func = function (time, value) {
			if (!entity) { entity = resolver(entityId); }
			//! AT: same here as above; a tmp fix
			if (entity) {
				var rotation = func.rotation;
				rotation[angleIndex] = value * MathUtils.DEG_TO_RAD;
				entity.transformComponent.transform.rotation.fromAngles(rotation[0], rotation[1], rotation[2]);
				entity.transformComponent.setUpdated();
			}
		};
		func.rotation = rotation;
		return func;
	};

	export default ValueChannel;

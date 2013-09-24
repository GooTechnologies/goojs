define([
/*	'goo/math/MathUtils' */
],
/** @lends */
function (
/*	MathUtils */
) {
	"use strict";

	/**
	 * @class Base class for animation channels. An animation channel describes a single element of an animation (such as the movement of a single
	 *        joint, or the play back of a specific sound, etc.) These channels are grouped together in an {@link AnimationClip} to describe a full animation.
	 * @param {string} channelName the name of our channel. This is immutable to this instance of the class.
	 * @param {number[]} times our time indices. Copied into the channel.
	 */
	// times goes away
	function AbstractAnimationChannel (channelName, times, blendType) {
		this._blendType = blendType || 'Linear';
		this._channelName = channelName;

		// no more time
		if ((times instanceof Array || times instanceof Float32Array) && times.length) {
			this._times = new Float32Array(times);
		} else {
			this._times = [];
		}
		//

		this._lastStartFrame = 0; // no more this
	}

	/**
	 * @returns {number} number of samples
	 */
	// no need for this
	AbstractAnimationChannel.prototype.getSampleCount = function () {
		return this._times.length;
	};

	/**
	 * @returns {number} The last time sample of the animation channel
	 */
	AbstractAnimationChannel.prototype.getMaxTime = function () {
		// this needs redoing
		return this._times.length ? this._times[this._times.length - 1] : 0;
	};

	/**
	 * Calculates which samples to use for extracting animation state, then applies the animation state to supplied data item.
	 * @param {number} clockTime
	 * @param {TransformData|TriggerData|number[]} applyTo
	 */
	AbstractAnimationChannel.prototype.updateSample = function (clockTime, applyTo) {
		var timeCount = this._times.length;

		if (!(timeCount)) {
			return;
		}
		// figure out what frames we are between and by how much
		var lastFrame = timeCount - 1;
		if (clockTime < 0 || timeCount === 1) {
			this.setCurrentSample(0, 0.0, applyTo, clockTime);
		} else if (clockTime >= this._times[lastFrame]) {
			this.setCurrentSample(lastFrame, 0.0, applyTo, clockTime);
		} else {
			var startFrame = 0;
			if (clockTime >= this._times[this._lastStartFrame]) {
				startFrame = this._lastStartFrame;
				var z = 0;
				// use binary search instead (wherever time may end up being stored)
				for (var i = this._lastStartFrame; i < timeCount - 1; i++) {
					z++;
					if (this._times[i] >= clockTime) {
						break;
					}
					startFrame = i;
				}
				//console.log('..............', z);
			} else {
				var zz = 0;
				for (var i = 0; i < this._lastStartFrame; i++) {
					zz++;
					if (this._times[i] >= clockTime) {
						break;
					}
					startFrame = i;
				}
				//console.log(',,,,,,,,,,,,,,', zz);
			}
			var progressPercent = (clockTime - this._times[startFrame]) / (this._times[startFrame + 1] - this._times[startFrame]);
			this.setCurrentSample(startFrame, progressPercent, applyTo, clockTime);

			this._lastStartFrame = startFrame;
		}
	};

	return AbstractAnimationChannel;
});
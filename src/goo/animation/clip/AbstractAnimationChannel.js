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
	 *        joint, or the play back of a specific sound, etc.) These channels are grouped together in an AnimationClip to describe a full animation.
	 * @param {string} channelName the name of our channel. This is immutable to this instance of the class.
	 * @param {number[]} times our time indices. Copied into the channel.
	 */
	function AbstractAnimationChannel (channelName, times, blendType) {
		this._blendType = blendType || 'Linear';
		this._channelName = channelName;
		this._times = times instanceof Array && times.length ? times.slice(0) : [];
	}

	AbstractAnimationChannel.prototype.getSampleCount = function () {
		return this._times.length;
	};

	AbstractAnimationChannel.prototype.getMaxTime = function () {
		return this._times.length ? this._times[this._times.length - 1] : 0;
	};

	AbstractAnimationChannel.prototype.updateSample = function (clockTime, applyTo) {
		if (!(this._times.length)) {
			return;
		}
		// figure out what frames we are between and by how much
		var lastFrame = this._times.length - 1;
		if (clockTime < 0 || this._times.length === 1) {
			this.setCurrentSample(0, 0.0, applyTo);
		} else if (clockTime >= this._times[lastFrame]) {
			this.setCurrentSample(lastFrame, 0.0, applyTo);
		} else {
			var startFrame = 0;

			for ( var i = 0; i < this._times.length - 1; i++) {
				if (this._times[i] < clockTime) {
					startFrame = i;
				}
			}
			var progressPercent = (clockTime - this._times[startFrame]) / (this._times[startFrame + 1] - this._times[startFrame]);
			/*
			if (this._blendType === 'SCurve3') {
				progressPercent = MathUtils.scurve3(progressPercent);
			} else if (this._blendType === 'SCurve5') {
				progressPercent = MathUtils.scurve5(progressPercent);
			}
			*/

			this.setCurrentSample(startFrame, progressPercent, applyTo);
		}
	};

	return AbstractAnimationChannel;
});
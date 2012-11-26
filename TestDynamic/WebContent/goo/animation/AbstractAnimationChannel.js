define(function() {
	"use strict";

	/**
	 * @name AbstractAnimationChannel
	 * @class Base class for animation channels. An animation channel describes a single element of an animation (such as the movement of a single
	 *        joint, or the play back of a specific sound, etc.) These channels are grouped together in an AnimationClip to describe a full animation.
	 * @param {String} channelName Name of channel
	 * @property {String} channelName Name of channel
	 */
	function AbstractAnimationChannel(channelName, times) {
		this.channelName = channelName;
		if (!times.length) {
			console.log('asdf');
		}
		this.times = times !== undefined ? times.slice(0) : []; // or null?
	}

	AbstractAnimationChannel.prototype.getMaxTime = function() {
		return this.times[this.times.length - 1];
	};

	AbstractAnimationChannel.prototype.updateSample = function(clockTime, applyTo) {
		// figure out what frames we are between and by how much
		var lastFrame = this.times.length - 1;
		if (clockTime < 0 || this.times.length === 1) {
			setCurrentSample(0, 0.0, applyTo);
		} else if (clockTime >= this.times[lastFrame]) {
			setCurrentSample(lastFrame, 0.0, applyTo);
		} else {
			var startFrame = 0;

			for ( var i = 0; i < this.times.length - 1; i++) {
				if (this.times[i] < clockTime) {
					startFrame = i;
				}
			}
			var progressPercent = (clockTime - this.times[startFrame]) / (this.times[startFrame + 1] - this.times[startFrame]);

			this.setCurrentSample(startFrame, progressPercent, applyTo);
		}
	};

	return AbstractAnimationChannel;
});
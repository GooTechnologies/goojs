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
		this.times = times !== undefined ? times.slice(0) : null;
	}

	AbstractAnimationChannel.prototype.getMaxTime = function() {
		return this.times[this.times.length - 1];
	};

	return AbstractAnimationChannel;
});
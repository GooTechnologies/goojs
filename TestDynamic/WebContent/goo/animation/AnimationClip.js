define(['goo/math/Transform'], function(Transform) {
	"use strict";

	/**
	 * @name AnimationClip
	 * @class Representation of a Joint in a Skeleton. Meant to be used within a specific Skeleton object.
	 * @param {String} name Name of joint
	 * @property {String} name Name of joint
	 */
	function AnimationClip(name, channels) {
		this.name = name;
		this.channels = channels || [];
		this.maxTime = 0;
	}

	/**
	 * Update an instance of this clip.
	 * 
	 * @param clockTime the current local clip time (where 0 == start of clip)
	 * @param instance the instance record to update.
	 */
	AnimationClip.prototype.update = function(clockTime, instance) {
		// Go through each channel and update clipState
		for ( var i = 0; i < this.channels.length; ++i) {
			var channel = this.channels[i];
			var applyTo = instance.getApplyTo(channel);
			channel.updateSample(clockTime, applyTo);
		}
	};

	return AnimationClip;
});
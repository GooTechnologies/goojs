define(

function () {
	'use strict';

	/**
	 * AnimationClip manages a set of animation channels as a single clip entity.
	 * @param {string} name Name of joint
	 * @param {Array<AbstractAnimationChannel>} [channels=[]] an array of channels to shallow copy locally.
	 */
	function AnimationClip (name, channels) {
		this._name = name;
		this._channels = channels || [];
		this._maxTime = -1;
		this.updateMaxTimeIndex();
	}

	/*
	 * Update an instance of this clip.
	 * @param {number} clockTime the current local clip time (where 0 == start of clip)
	 * @param {AnimationClipInstance} instance the instance record to update.
	 */
	AnimationClip.prototype.update = function (clockTime, instance) {
		// Go through each channel and update clipState
		for ( var i = 0, max = this._channels.length; i < max; ++i) {
			var channel = this._channels[i];
			var applyTo = instance.getApplyTo(channel);
			channel.updateSample(clockTime, applyTo);
		}
	};

	/**
	 * Add a channel to this clip.
	 * @param {AbstractAnimationChannel} channel the channel to add.
	 */
	AnimationClip.prototype.addChannel = function (channel) {
		this._channels.push(channel);
		this.updateMaxTimeIndex();
	};

	/**
	 * Remove a given channel from this clip.
	 * @param {AbstractAnimationChannel} channel the channel to remove.
	 * @returns {boolean} true if this clip had the given channel and it was removed.
	 */
	AnimationClip.prototype.removeChannel = function (channel) {
		var idx = this._channels.indexOf(channel);
		if (idx >= 0) {
			this._channels.splice(idx, 1);
			this.updateMaxTimeIndex();
			return true;
		}
		return false;
	};

	/**
	 * Locate a channel in this clip using its channel name.
	 * @param {string} channelName the name to match against.
	 * @returns {AbstractAnimationChannel} the first channel with a name matching the given channelName, or null if no matches are found.
	 */
	AnimationClip.prototype.findChannelByName = function (channelName) {
		for ( var i = 0, max = this._channels.length; i < max; ++i) {
			var channel = this._channels[i];
			if (channelName === channel._channelName) {
				return channel;
			}
		}
		return null;
	};

	/*
	 * Update our max time value to match the max time in our managed animation channels.
	 */
	AnimationClip.prototype.updateMaxTimeIndex = function () {
		this._maxTime = -1;
		var max;
		for ( var i = 0; i < this._channels.length; i++) {
			var channel = this._channels[i];
			max = channel.getMaxTime();
			if (max > this._maxTime) {
				this._maxTime = max;
			}
		}
	};

	AnimationClip.prototype.toString = function () {
		return this._name + ': '
			+ this._channels.map(function (channel) { return channel._channelName; });
	};

	return AnimationClip;
});
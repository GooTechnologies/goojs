define(
	/** @lends AnimationClipInstance */
	function () {
	"use strict";

	/**
	 * @class Maintains state information about an instance of a specific animation clip, such as time scaling applied, active flag, start time of the
	 *        instance, etc.
	 */
	function AnimationClipInstance() {
		this._active = true;
		this._loopCount = 0;
		this._timeScale = 1.0;
		this._startTime = 0.0;
		this._clipStateObjects = {};
		this._animationListeners = [];
	}

	AnimationClipInstance.prototype.getApplyTo = function (channel) {
		var channelName = channel._channelName;
		var rVal = this._clipStateObjects[channelName];
		if (!rVal) {
			rVal = channel.createStateDataObject();
			this._clipStateObjects[channelName] = rVal;
		}
		return rVal;
	};

	/**
	 * @description Tell any animation listeners on this instance that the associated clip has finished playing.
	 */
	AnimationClipInstance.prototype.fireAnimationFinished = function () {
		for (var i = 0, max = this._animationListeners.length; i < max; i++) {
			this._animationListeners[i].animationFinished(this);
		}
	};

	return AnimationClipInstance;
});
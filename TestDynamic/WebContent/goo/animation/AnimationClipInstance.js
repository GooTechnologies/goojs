define(function() {
	"use strict";

	/**
	 * @name AnimationClipInstance
	 * @class Maintains state information about an instance of a specific animation clip, such as time scaling applied, active flag, start time of the
	 *        instance, etc.
	 */
	function AnimationClipInstance() {
		this._active = true;
		this._loopCount = 0;
		this._timeScale = 1.0;
		this._startTime = 0.0;
		this._clipStateObjects = {};
		this.animationListeners = [];
	}

	return AnimationClipInstance;
});
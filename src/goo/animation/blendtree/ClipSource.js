define([
	'goo/math/MathUtils',
	'goo/entites/World',
	'goo/animation/clip/AnimationClipInstance'
],
/** @lends */
function (
	MathUtils,
	World,
	AnimationClipInstance
) {
	"use strict";

	/**
	 * @class A blend tree leaf node that samples and returns values from the channels of an AnimationClip.
	 * @param clip the clip to use.
	 * @param manager the manager to track clip state with.
	 */
	function ClipSource (clip) {
		this._clip = clip;
		this._clipInstance = new AnimationClipInstance();
	}

	ClipSource.prototype.setTime = function (globalTime) {
		var instance = this._clipInstance;
		if(!instance._startTime) {
			instance._startTime = globalTime;
		}

		var clockTime;
		if (instance._active) {
			if (instance._timeScale !== 0.0) {
				instance._prevUnscaledClockTime = globalTime - instance._startTime;
				clockTime = instance._timeScale * instance._prevUnscaledClockTime;
				instance._prevClockTime = clockTime;
			} else {
				clockTime = instance._prevClockTime;
			}

			var maxTime = this._clip._maxTime;
			if (maxTime === -1) {
				return false;
			}

			// Check for looping.
			if (maxTime !== 0) {
				if (instance._loopCount === -1 || instance._loopCount > 1 && maxTime * instance._loopCount >= Math.abs(clockTime)) {
					if (clockTime < 0) {
						clockTime = maxTime + clockTime % maxTime;
					} else {
						clockTime %= maxTime;
					}
				} else if (clockTime < 0) {
					clockTime = maxTime + clockTime;
				}

				// Check for past max time
				if (clockTime > maxTime || clockTime < 0) {
					clockTime = MathUtils.clamp(clockTime, 0, maxTime);
					// signal to any listeners that we have ended our animation.
					instance.fireAnimationFinished();
					// deactivate this instance of the clip
					instance._active = false;
				}
			}

			// update the clip with the correct clip local time.
			this._clip.update(clockTime, instance);
		}
		return instance._active;
	};

	ClipSource.prototype.resetClips = function (globalTime) {
		this._clipInstance._startTime = globalTime;
		this._clipInstance._active = true;
	};

	ClipSource.prototype.isActive = function () {
		return this._clipInstance._active && (this._clip._maxTime !== -1);
	};

	ClipSource.prototype.getSourceData = function () {
		return this._clipInstance._clipStateObjects;
	};

	return ClipSource;
});
define(['goo/math/MathUtils'],
/** @lends ClipSource */
function (MathUtils) {
	"use strict";

	/**
	 * @class A blend tree leaf node that samples and returns values from the channels of an AnimationClip.
	 * @param clip the clip to use.
	 * @param manager the manager to track clip state with.
	 */
	function ClipSource (clip, manager) {
		this._clip = clip;

		manager.getClipInstance(clip);
	}

	ClipSource.prototype.setTime = function (globalTime, manager) {
		var instance = manager.getClipInstance(this._clip);
		if (instance._active) {
			var clockTime = instance._timeScale * (globalTime - instance._startTime);

			var maxTime = this._clip._maxTime;
			if (maxTime == -1) {
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

	ClipSource.prototype.resetClips = function (manager, globalStartTime) {
		manager.resetClipInstance(this._clip, globalStartTime);
	};

	ClipSource.prototype.isActive = function (manager) {
		var instance = manager.getClipInstance(this._clip);
		return instance._active && (this._clip._maxTime !== -1);
	};

	ClipSource.prototype.getSourceData = function (manager) {
		return manager.getClipInstance(this._clip)._clipStateObjects;
	};

	return ClipSource;
});
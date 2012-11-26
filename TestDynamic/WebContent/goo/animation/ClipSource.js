define(['goo/math/Transform'], function(Transform) {
	"use strict";

	/**
	 * @name ClipSource
	 * @class A blend tree leaf node that samples and returns values from the channels of an AnimationClip.
	 * @param clip the clip to use.
	 * @param manager the manager to track clip state with.
	 */
	function ClipSource(clip, manager) {
		this.clip = clip;

		manager.getClipInstance(clip);
	}

	ClipSource.prototype.setTime = function(globalTime, manager) {
		var instance = manager.getClipInstance(this.clip);
		if (instance._active) {
			var clockTime = instance._timeScale * (globalTime - instance._startTime);

			var maxTime = this.clip.maxTime;
			if (maxTime <= 0) {
				return false;
			}

			// Check for looping.
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
				instance.setActive(false);
			}

			// update the clip with the correct clip local time.
			this.clip.update(clockTime, instance);
		}
		return instance._active;
	};

	ClipSource.prototype.isActive = function(manager) {
		var instance = manager.getClipInstance(this.clip);
		return instance._active && this.clip.maxTime > 0;
	};

	ClipSource.prototype.getSourceData = function(manager) {
		return manager.getClipInstance(this.clip)._clipStateObjects;
	};

	return ClipSource;
});
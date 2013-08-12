define([
	'goo/math/MathUtils',
	'goo/animation/clip/AnimationClipInstance'
],
/** @lends */
function (
	MathUtils,
	AnimationClipInstance
) {
	"use strict";

	/**
	 * @class A blend tree leaf node that samples and returns values from the channels of an AnimationClip.
	 * @param {AnimationClip} clip the clip to use.
	 * @param {string} [filter] 'Exclude' or 'Include'
	 * @param {string[]} [channelNames]
	 */
	function ClipSource (clip, filter, channelNames) {
		this._clip = clip;
		this._clipInstance = new AnimationClipInstance();

		this._filterChannels = {};
		if(filter && channelNames) {
			this._filter = (['Exclude', 'Include'].indexOf(filter) > -1) ? filter : null;
			for (var i = 0; i < channelNames.length; i++) {
				this._filterChannels[channelNames[i]] = true;
			}
		}
	}

	/*
	 * Sets the current time and moves the {@link AnimationClipInstance} forward
	 * @param {number} globalTime
	 */
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
					// deactivate this instance of the clip
					instance._active = false;
				}
			}

			// update the clip with the correct clip local time.
			this._clip.update(clockTime, instance);
		}
		return instance._active;
	};

	/*
	 * Sets start time of clipinstance. If set to current time, clip is reset
	 * @param {number} globalTime
	 */
	ClipSource.prototype.resetClips = function (globalTime) {
		this._clipInstance._startTime = globalTime;
		this._clipInstance._active = true;
	};

	ClipSource.prototype.setTimeScale = function (timeScale) {
		this._clipInstance.setTimeScale(timeScale);
	};

	/*
	 * @returns {boolean} if clipsource is active
	 */
	ClipSource.prototype.isActive = function () {
		return this._clipInstance._active && (this._clip._maxTime !== -1);
	};

	/*
	 * @return a source data mapping for the channels in this clip source
	 */
	ClipSource.prototype.getSourceData = function () {
		if(!this._filter || !this._filterChannels) {
			return this._clipInstance._clipStateObjects;
		}
		var cso = this._clipInstance._clipStateObjects;
		var rVal = {};

		var filter = (this._filter === 'Include');

		for (var key in cso) {
			if ((this._filterChannels[key] !== undefined) === filter) {
				rVal[key] = cso[key];
			}
		}
		return rVal;
	};

	return ClipSource;
});
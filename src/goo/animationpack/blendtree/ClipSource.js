define([
	'goo/math/MathUtils',
	'goo/animationpack/clip/AnimationClipInstance'
], function (
	MathUtils,
	AnimationClipInstance
) {
	'use strict';

	/**
	 * A blend tree leaf node that samples and returns values from the channels of an AnimationClip.
	 * @param {AnimationClip} clip the clip to use.
	 * @param {string} [filter] 'Exclude' or 'Include'
	 * @param {string[]} [channelNames]
	 */
	function ClipSource(clip, filter, channelNames) {
		this._clip = clip;
		this._clipInstance = new AnimationClipInstance();

		this._filterChannels = {};
		this._filter = null;
		this.setFilter(filter, channelNames);

		this._startTime = -Infinity;
		this._endTime = Infinity;
	}

	/**
	 * Sets the filter on the joints which the clipsource will affect
	 * @param {string} [filter] 'Exclude' or 'Include'
	 * @param {string[]} [channelNames]
	 */
	ClipSource.prototype.setFilter = function (filter, channelNames) {
		if (filter && channelNames) {
			this._filter = (['Exclude', 'Include'].indexOf(filter) > -1) ? filter : null;
			for (var i = 0; i < channelNames.length; i++) {
				this._filterChannels[channelNames[i]] = true;
			}
		} else {
			this._filter = null;
		}
	};

	/**
	 * Sets the current time and moves the {@link AnimationClipInstance} forward
	 * @param {number} globalTime
	 * @private
	 */
	ClipSource.prototype.setTime = function (globalTime) {
		var instance = this._clipInstance;
		if (typeof instance._startTime !== 'number') {
			instance._startTime = globalTime;
		}

		var clockTime;
		var duration;
		if (instance._active) {
			if (instance._timeScale !== 0.0) {
				instance._prevUnscaledClockTime = globalTime - instance._startTime;
				clockTime = instance._timeScale * instance._prevUnscaledClockTime;
				instance._prevClockTime = clockTime;
			} else {
				clockTime = instance._prevClockTime;
			}

			var maxTime = Math.min(this._clip._maxTime, this._endTime);
			var minTime = Math.max(this._startTime, 0);
			duration = maxTime - minTime;
			if (maxTime === -1) {
				return false;
			}

			// Check for looping
			if (maxTime !== 0) {
				if (instance._loopCount === -1) {
					if (clockTime < 0) {
						clockTime *= -1;
						clockTime %= duration;
						clockTime = duration - clockTime;
						clockTime += minTime;
					} else {
						clockTime %= duration;
						clockTime += minTime;
					}
				} else if (instance._loopCount > 0 && duration * instance._loopCount >= Math.abs(clockTime)) {
					// probably still the same?
					if (clockTime < 0) {
						clockTime *= -1;
						clockTime %= duration;
						clockTime = duration - clockTime;
						clockTime += minTime;
					} else {
						clockTime %= duration;
						clockTime += minTime;
					}
				}

				if (clockTime > maxTime || clockTime < minTime) {
					clockTime = MathUtils.clamp(clockTime, minTime, maxTime);
					// deactivate this instance of the clip
					instance._active = false;
				}
			}

			// update the clip with the correct clip local time.
			this._clip.update(clockTime, instance);
		}
		return instance._active;
	};

	/**
	 * Sets start time of clipinstance. If set to current time, clip is reset
	 * @param {number} globalTime
	 * @private
	 */
	ClipSource.prototype.resetClips = function (globalTime) {
		this._clipInstance._startTime = typeof globalTime !== 'undefined' ? globalTime : 0;
		this._clipInstance._active = true;
	};

	/**
	 * @private
	 */
	ClipSource.prototype.shiftClipTime = function (shiftTime) {
		this._clipInstance._startTime += shiftTime;
		this._clipInstance._active = true;  // ?
	};

	/**
	 * @private
	 */
	ClipSource.prototype.setTimeScale = function (timeScale) {
		this._clipInstance.setTimeScale(timeScale);
	};

	/**
	 * @returns {boolean} if clipsource is active
	 * @private
	 */
	ClipSource.prototype.isActive = function () {
		return this._clipInstance._active && (this._clip._maxTime !== -1);
	};

	/**
	 * @returns a source data mapping for the channels in this clip source
	 * @private
	 */
	ClipSource.prototype.getSourceData = function () {
		if (!this._filter || !this._filterChannels) {
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

	/**
	 * @returns {ClipSource}
	 */
	ClipSource.prototype.clone = function () {
		var cloned = new ClipSource(this._clip);

		cloned._clipInstance = this._clipInstance.clone();

		cloned._filter = this._filter;

		for (var key in this._filterChannels) {
			cloned._filterChannels[key] = this._filterChannels[key];
		}

		cloned._startTime = this._startTime;
		cloned._endTime = this._endTime;

		return cloned;
	};

	return ClipSource;
});
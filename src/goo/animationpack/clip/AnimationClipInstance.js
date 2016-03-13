var World = require('../../entities/World');



	/**
	 * Maintains state information about an instance of a specific animation clip, such as time scaling applied, active flag, start time of the
	 *        instance, etc.
	 */
	function AnimationClipInstance () {
		this._active = true;
		this._loopCount = 0;
		this._timeScale = 1.0;
		this._startTime = 0.0;
		this._prevClockTime = 0.0;
		this._prevUnscaledClockTime = 0.0;
		this._clipStateObjects = {};
	}

	/**
	 * Sets the timescale of the animation, speeding it up or slowing it down
	 * @param {number} scale
	 * @param {number} [globalTime=World.time]
	 */
	AnimationClipInstance.prototype.setTimeScale = function (scale, globalTime) {
		globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
		if (this._active && this._timeScale !== scale) {
			if (this._timeScale !== 0.0 && scale !== 0.0) {
				// move startTime to account for change in scale
				var now = globalTime;
				var timePassed = now - this._startTime;
				timePassed *= this._timeScale;
				timePassed /= scale;
				this._startTime = now - timePassed;
			} else if (this._timeScale === 0.0) {
				var now = globalTime;
				this._startTime = now - this._prevUnscaledClockTime;
			}
		}
		this._timeScale = scale;
	};

	/**
	 * Gives the corresponding data for a channel, to apply animations to
	 * @param {AbstractAnimationChannel} channel
	 * @returns {(TransformData|TriggerData|Array<number>)} the animation data item
	 */
	AnimationClipInstance.prototype.getApplyTo = function (channel) {
		var channelName = channel._channelName;
		var rVal = this._clipStateObjects[channelName];
		if (!rVal) {
			rVal = channel.createStateDataObject();
			this._clipStateObjects[channelName] = rVal;
		}
		return rVal;
	};

	AnimationClipInstance.prototype.clone = function () {
		var cloned = new AnimationClipInstance();

		cloned._active = this._active;
		cloned._loopCount = this._loopCount;
		cloned._timeScale = this._timeScale;

		return cloned;
	};

	module.exports = AnimationClipInstance;
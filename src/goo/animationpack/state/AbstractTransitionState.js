define([
	'goo/animationpack/state/AbstractState',
	'goo/animationpack/blendtree/BinaryLerpSource',
	'goo/math/MathUtils'
], function (
	AbstractState,
	BinaryLerpSource,
	MathUtils
) {
	'use strict';

	/**
	 * An abstract transition state that blends between two other states.
	 * @extends AbstractState
	 * @private
	 */

	function AbstractTransitionState() {
		AbstractState.call(this);

		this._sourceState = null;
		this._targetState = null;
		this._percent = 0.0;
		this._sourceData = null;
		this._fadeTime = 0;
		this._blendType = 'Linear';
	}

	AbstractTransitionState.prototype = Object.create(AbstractState.prototype);
	AbstractTransitionState.prototype.constructor = AbstractTransitionState;

	/**
	 * Update this state using the current global time.
	 * @param {Number} globalTime the current global time.
	 */
	// Was: function (globalTime, layer)
	AbstractTransitionState.prototype.update = function (globalTime) {
		var currentTime = globalTime - this._globalStartTime;
		if(currentTime > this._fadeTime && this.onFinished) {
			this.onFinished();
			return;
		}
		var percent = currentTime / this._fadeTime;
		switch (this._blendType) {
			case 'SCurve3':
				this._percent = MathUtils.scurve3(percent);
				break;
			case 'SCurve5':
				this._percent = MathUtils.scurve5(percent);
				break;
			default:
				this._percent = percent;
		}
	};

	/**
	 * Method for setting fade time and blend type from config data.
	 * @param {Object} configuration data
	 */

	AbstractTransitionState.prototype.readFromConfig = function(config) {
		if (config) {
			if (config.fadeTime !== undefined) { this._fadeTime = config.fadeTime; }
			if (config.blendType !== undefined) { this._blendType = config.blendType; }
		}
	};

	/**
	 * @returns the current map of source channel data for this layer.
	 */
	AbstractTransitionState.prototype.getCurrentSourceData = function () {
		// grab our data maps from the two states
		var sourceAData = this._sourceState ? this._sourceState.getCurrentSourceData() : null;
		var sourceBData = this._targetState ? this._targetState.getCurrentSourceData() : null;

		// reuse previous _sourceData transforms to avoid re-creating
		// too many new transform data objects. This assumes that a
		// same state always returns the same transform data objects.
		if (!this._sourceData) {
			this._sourceData = {};
		}
		return BinaryLerpSource.combineSourceData(sourceAData, sourceBData, this._percent, this._sourceData);
	};

	/**
	 * Check if a transition is valid within a given time window.
	 *
	 * @param {Array} timeWindow start and end time
	 * @param {Number} current world time
	 * @returns {Boolean} true if transition is valid
	 */

	AbstractTransitionState.prototype.isValid = function(timeWindow, globalTime) {
		var localTime = globalTime - this._sourceState._globalStartTime;
		var start = timeWindow[0];
		var end = timeWindow[1];

		if (start <= 0) {
			if (end <= 0) {
				// no window, so true
				return true;
			} else {
				// just check end
				return localTime <= end;
			}
		} else {
			if (end <= 0) {
				// just check start
				return localTime >= start;
			} else if (start <= end) {
				// check between start and end
				return start <= localTime && localTime <= end;
			} else {
				// start is greater than end, so there are two windows.
				return localTime >= start || localTime <= end;
			}
		}
	};

	AbstractTransitionState.prototype.resetClips = function(globalTime) {
		AbstractState.prototype.resetClips.call(this, globalTime);
		//this._sourceData = {};
		this._percent = 0.0;
	};

	AbstractTransitionState.prototype.shiftClipTime = function(shiftTime) {
		AbstractState.prototype.shiftClipTime.call(this, shiftTime);
		//this._percent = 0.0;  // definitely not 0, or maybe 0
	};

	AbstractTransitionState.prototype.setTimeScale = function (timeScale) {
		if (this._sourceState) {
			this._sourceState.setTimeScale(timeScale);
		}
		if (this._targetState) {
			this._targetState.setTimeScale(timeScale);
		}
	};

	return AbstractTransitionState;
});
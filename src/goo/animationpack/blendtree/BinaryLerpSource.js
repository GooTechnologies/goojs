var MathUtils = require('goo/math/MathUtils');
var TransformData = require('goo/animationpack/clip/TransformData');

	'use strict';

	/**
	 * Takes two blend sources and uses linear interpolation to merge {@link TransformData} values. If one of the sources is null, or does not have a
	 *        key that the other does, we disregard weighting and use the non-null side's full value. Source data that is not {@link TransformData}, {@link JointData} or float data is not
	 *        combined, rather A's value will always be used unless it is null.
	 * @param {(ClipSource|BinaryLerpSource|FrozenClipSource|ManagedTransformSource)} sourceA our first source.
	 * @param {(ClipSource|BinaryLerpSource|FrozenClipSource|ManagedTransformSource)} sourceB our second source.
	 * @param {number} blendKey A key into the related AnimationManager's values store for pulling blend weighting.
	 * @private
	 */
	function BinaryLerpSource(sourceA, sourceB, blendWeight) {
		this._sourceA = sourceA ? sourceA : null;
		this._sourceB = sourceB ? sourceB : null;
		this.blendWeight = blendWeight ? blendWeight : null;
	}

	/*
	 * @returns a source data mapping for the channels in this clip source
	 */
	BinaryLerpSource.prototype.getSourceData = function () {
		// grab our data maps from the two sources
		var sourceAData = this._sourceA ? this._sourceA.getSourceData() : null;
		var sourceBData = this._sourceB ? this._sourceB.getSourceData() : null;

		return BinaryLerpSource.combineSourceData(sourceAData, sourceBData, this.blendWeight);
	};

	/**
	 * Sets the current time and moves the {@link AnimationClipInstance} forward
	 * @param {number} globalTime
	 */
	BinaryLerpSource.prototype.setTime = function (globalTime) {
		// set our time on the two sub sources
		var activeA = false;
		var activeB = false;
		if (this._sourceA) {
			activeA = this._sourceA.setTime(globalTime);
		}
		if (this._sourceB) {
			activeB = this._sourceB.setTime(globalTime);
		}
		return activeA || activeB;
	};

	/**
	 * Sets start time of clipinstance. If set to current time, clip is reset
	 * @param {number} globalStartTime
	 */
	BinaryLerpSource.prototype.resetClips = function (globalStartTime) {
		// reset our two sub sources
		if (this._sourceA) {
			this._sourceA.resetClips(globalStartTime);
		}
		if (this._sourceB) {
			this._sourceB.resetClips(globalStartTime);
		}
	};

	BinaryLerpSource.prototype.shiftClipTime = function (shiftTime) {
		// reset our two sub sources
		if (this._sourceA) {
			this._sourceA.shiftClipTime(shiftTime);
		}
		if (this._sourceB) {
			this._sourceB.shiftClipTime(shiftTime);
		}
	};

	/**
	 * Sets the time scale for sources A and B
	 * @param {number} timeScale
	 */
	BinaryLerpSource.prototype.setTimeScale = function (timeScale) {
		this._sourceA.setTimeScale(timeScale);
		this._sourceB.setTimeScale(timeScale);
	};

	/**
	 * @returns {boolean} from calling the isActive method on sources A or B
	 */
	BinaryLerpSource.prototype.isActive = function () {
		var foundActive = false;
		if (this._sourceA) {
			foundActive = foundActive || this._sourceA.isActive();
		}
		if (this._sourceB) {
			foundActive = foundActive || this._sourceB.isActive();
		}
		return foundActive;
	};

	/**
	 * Blends two sourceData maps together
	 * @param {Object} sourceAData
	 * @param {Object} sourceBData
	 * @param {number} blendWeight
	 * @param {Object} [store] If store is supplied, the result is stored there
	 * @returns {Object} The blended result,
	 */
	BinaryLerpSource.combineSourceData = function (sourceAData, sourceBData, blendWeight, store) {
		if (!sourceBData) {
			return sourceAData;
		} else if (!sourceAData) {
			return sourceBData;
		}

		var rVal = store ? store : {};

		for (var key in sourceAData) {
			var dataA = sourceAData[key];
			var dataB = sourceBData[key];
			if (!isNaN(dataA)) {
				BinaryLerpSource.blendFloatValues(rVal, key, blendWeight, dataA, dataB);
				continue;
			} else if (!(dataA instanceof TransformData)) {
				// A will always override if not null.
				rVal[key] = dataA;
				continue;
			}

			// Grab the transform data for each clip
			if (dataB) {
				rVal[key] = dataA.blend(dataB, blendWeight, rVal[key]);
			} else {
				if (!rVal[key]) {
					rVal[key] = new dataA.constructor(dataA);
				} else {
					rVal[key].set(dataA);
				}
			}
		}
		for ( var key in sourceBData) {
			if (rVal[key]) {
				continue;
			}
			rVal[key] = sourceBData[key];
		}

		return rVal;
	};

	/**
	 * Blends two float values and stores them in rVal
	 * @param {Object} rVal The object in which to store result
	 * @param {string} key The key to object rVal, so rVal[key] is the store
	 * @param {number} blendWeight
	 * @param {Array<number>} dataA The float is wrapped in an array
	 * @param {Array<number>} dataB The float is wrapped in an array
	 */
	BinaryLerpSource.blendFloatValues = function (rVal, key, blendWeight, dataA, dataB) {
		if (isNaN(dataB)) {
			rVal[key] = dataA;
		} else {
			rVal[key] = MathUtils.lerp(blendWeight, dataA[0], dataB[0]);
		}
	};

	BinaryLerpSource.prototype.clone = function () {
		return new BinaryLerpSource (
			this._sourceA,
			this._sourceB,
			this._blendWeight
		);
	};

	module.exports = BinaryLerpSource;
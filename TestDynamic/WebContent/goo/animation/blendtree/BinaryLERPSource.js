define(['goo/math/MathUtils', 'goo/animation/clip/TransformData', 'goo/animation/blendtree/AbstractTwoPartSource'], function(MathUtils,
	TransformData, AbstractTwoPartSource) {
	"use strict";

	BinaryLERPSource.prototype = Object.create(AbstractTwoPartSource.prototype);

	/**
	 * @name BinaryLERPSource
	 * @class Takes two blend sources and uses linear interpolation to merge TransformData values. If one of the sources is null, or does not have a
	 *        key that the other does, we disregard weighting and use the non-null side's full value. Source data that is not TransformData is not
	 *        combined, rather A's value will always be used unless it is null.
	 * @param sourceA our first source.
	 * @param sourceB our second source.
	 * @param blendKey A key into the related AnimationManager's values store for pulling blend weighting.
	 */
	function BinaryLERPSource(sourceA, sourceB, blendKey) {
		AbstractTwoPartSource.call(this, sourceA, sourceB, blendKey);
	}

	BinaryLERPSource.prototype.getSourceData = function(manager) {
		// grab our data maps from the two sources
		var sourceAData = this._sourceA ? this._sourceA.getSourceData(manager) : null;
		var sourceBData = this._sourceB ? this._sourceB.getSourceData(manager) : null;

		return BinaryLERPSource.combineSourceData(sourceAData, sourceBData, manager.getValuesStore().get(getBlendKey()));
	};

	BinaryLERPSource.prototype.setTime = function(globalTime, manager) {
		// set our time on the two sub sources
		var foundActive = false;
		if (this._sourceA) {
			foundActive |= this._sourceA.setTime(globalTime, manager);
		}
		if (this._sourceB) {
			foundActive |= this._sourceB.setTime(globalTime, manager);
		}
		return foundActive;
	};

	BinaryLERPSource.prototype.resetClips = function(manager, globalStartTime) {
		// reset our two sub sources
		if (this._sourceA) {
			this._sourceA.resetClips(manager, globalStartTime);
		}
		if (this._sourceB) {
			this._sourceB.resetClips(manager, globalStartTime);
		}
	};

	BinaryLERPSource.prototype.isActive = function(manager) {
		var foundActive = false;
		if (this._sourceA) {
			foundActive |= this._sourceA.isActive(manager);
		}
		if (this._sourceB) {
			foundActive |= this._sourceB.isActive(manager);
		}
		return foundActive;
	};

	BinaryLERPSource.combineSourceData = function(sourceAData, sourceBData, blendWeight, store) {
		if (!sourceBData) {
			return sourceAData;
		} else if (!sourceAData) {
			return sourceBData;
		}

		var rVal = store ? store : {};

		for ( var key in sourceAData) {
			var dataA = sourceAData[key];
			var dataB = sourceBData[key];
			if (!isNaN(dataA)) {
				BinaryLERPSource.blendFloatValues(rVal, key, blendWeight, dataA, dataB);
				continue;
			} else if (!(dataA instanceof TransformData)) {
				// A will always override if not null.
				rVal[key] = dataA;
				continue;
			}

			// Grab the transform data for each clip
			if (transformB) {
				rVal[key] = dataA.blend(dataB, blendWeight, rVal[key]);
			} else {
				rVal[key] = dataA;
			}
		}
		for ( var key in sourceBData) {
			if (rVal[key]) {
				continue;
			}
			rVal[key] = entryBData[key];
		}

		return rVal;
	};

	BinaryLERPSource.combineSourceData = function(rVal, key, blendWeight, dataA, dataB) {
		if (isNaN(dataB)) {
			rVal[key] = dataA;
		} else {
			rVal[key] = MathUtils.lerp(blendWeight, dataA[0], dataB[0]);
		}
	};

	return BinaryLERPSource;
});
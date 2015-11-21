var BinaryLerpSource = require('goo/animationpack/blendtree/BinaryLerpSource');

	'use strict';

	/**
	 * A layer blender that uses linear interpolation to merge the results of two layers.
	 */
	function LayerLerpBlender() {
		this._blendWeight = null;
		this._layerA = null;
		this._layerB = null;
	}

	/**
	 * @returns a key-value map representing the blended data from both animation layers.
	 */
	LayerLerpBlender.prototype.getBlendedSourceData = function () {
		// grab our data maps from the two layers...
		// set A
		var sourceAData = this._layerA.getCurrentSourceData();
		// set B
		var sourceBData = this._layerB._currentState ? this._layerB._currentState.getCurrentSourceData() : null;

		return BinaryLerpSource.combineSourceData(sourceAData, sourceBData, this._blendWeight);
	};

	module.exports = LayerLerpBlender;
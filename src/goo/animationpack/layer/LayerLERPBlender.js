define([
	'goo/animationpack/blendtree/BinaryLERPSource'
], function (
	BinaryLERPSource
) {
	'use strict';

	/**
	 * @class A layer blender that uses linear interpolation to merge the results of two layers.
	 */
	function LayerLERPBlender() {
		this._blendWeight = null;
		this._layerA = null;
		this._layerB = null;
	}

	/**
	 * @return a key-value map representing the blended data from both animation layers.
	 */
	LayerLERPBlender.prototype.getBlendedSourceData = function () {
		// grab our data maps from the two layers...
		// set A
		var sourceAData = this._layerA.getCurrentSourceData();
		// set B
		var sourceBData = this._layerB._currentState ? this._layerB._currentState.getCurrentSourceData() : null;

		return BinaryLERPSource.combineSourceData(sourceAData, sourceBData, this._blendWeight);
	};

	return LayerLERPBlender;
});
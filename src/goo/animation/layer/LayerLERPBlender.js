define(['goo/animation/blendtree/BinaryLERPSource'],
/** @lends */
function (BinaryLERPSource) {
	"use strict";

	/**
	 * @class A layer blender that uses linear interpolation to merge the results of two layers.
	 * @param {String} name Name of layer
	 * @property {String} name Name of layer
	 */
	function LayerLERPBlender () {
		this._blendKey = null;
		this._layerA = null;
		this._layerB = null;
	}

	/**
	 * @param manager the manager this is being called from
	 * @return a key-value map representing the blended data from both animation layers.
	 */
	LayerLERPBlender.prototype.getBlendedSourceData = function (manager) {
		// grab our data maps from the two layers...
		// set A
		var sourceAData = this._layerA.getCurrentSourceData();
		// set B
		var sourceBData = this._layerB._currentState ? this._layerB._currentState.getCurrentSourceData(manager) : null;

		return BinaryLERPSource.combineSourceData(sourceAData, sourceBData, manager._valuesStore[this._blendKey]);
	};

	return LayerLERPBlender;
});
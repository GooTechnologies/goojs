define(['goo/animation/clip/TransformData'],
	/** @lends JointData */
	function (TransformData) {
	"use strict";

	/**
	 * @class Describes transform of a joint.
	 * @param our optional JointData source to copy.
	 */
	function JointData(source) {
		TransformData.call(this, source);
		this._jointIndex = source ? source._jointIndex : 0;
	}

	JointData.prototype = Object.create(TransformData.prototype);

	/**
	 * @description Copy the source's values into this transform data object.
	 * @param source our source to copy. Must not be null.
	 */
	JointData.prototype.set = function (jointData) {
		TransformData.prototype.set.call(this, jointData);
		this._jointIndex = source._jointIndex;
	};

	/**
	 * @description Blend this transform with the given transform.
	 * @param blendTo The transform to blend to
	 * @param blendWeight The blend weight
	 * @param store The transform store.
	 * @return The blended transform.
	 */
	JointData.prototype.blend = function (blendTo, blendWeight, store) {
		var rVal = store;
		if (!rVal) {
			rVal = new JointData();
			rVal._jointIndex = this._jointIndex;
		} else if (rVal instanceof JointData) {
			rVal._jointIndex = this._jointIndex;
		}
		return TransformData.prototype.blend.call(this, blendTo, blendWeight, rVal);
	};

	return JointData;
});
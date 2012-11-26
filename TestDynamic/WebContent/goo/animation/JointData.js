define(['goo/animation/TransformData'], function(TransformData) {
	"use strict";

	JointData.prototype = Object.create(TransformData.prototype);

	/**
	 * @name JointData
	 * @class Describes transform of a joint.
	 */
	function JointData(source) {
		TransformData.call(this, source);

		this._jointIndex = 0;
	}

	return JointData;
});
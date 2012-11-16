define(['goo/math/Transform'], function(Transform) {
	"use strict";

	/**
	 * @name Joint
	 * @class The purpose of this class is to hold additional information regarding a typedarray buffer, like vbo 'usage' flags
	 * @param {ArrayBuffer} data Data to wrap
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function Joint(name) {
		this.name = name;

		this.index = 0;
		this.parentIndex = 0;
		this.inverseBindPose = new Transform();
	}

	Joint.NO_PARENT = Number.MIN_VALUE;

	return Joint;
});
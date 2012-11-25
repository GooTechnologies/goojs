define(['goo/math/Transform'], function(Transform) {
	"use strict";

	/**
	 * @name Joint
	 * @class Representation of a Joint in a Skeleton. Meant to be used within a specific Skeleton object.
	 * @param {String} name Name of joint
	 * @property {String} name Name of joint
	 */
	function Joint(name) {
		this.name = name;

		this.index = 0;
		this.parentIndex = 0;
		this.inverseBindPose = new Transform();
	}

	Joint.NO_PARENT = -32768;

	return Joint;
});
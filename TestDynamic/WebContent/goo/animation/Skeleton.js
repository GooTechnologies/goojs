define(function() {
	"use strict";

	/**
	 * @name Skeleton
	 * @class The purpose of this class is to hold additional information regarding a typedarray buffer, like vbo 'usage' flags
	 * @param {ArrayBuffer} data Data to wrap
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function Skeleton(name, joints) {
		this.name = name;
		this.joints = joints;
	}

	return Skeleton;
});
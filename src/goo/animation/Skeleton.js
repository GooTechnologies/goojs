define(function () {
	"use strict";

	/**
	 * @name Skeleton
	 * @class Describes a collection of Joints. This class represents the hierarchy of a Skeleton and its original aspect (via the Joint class). This
	 *        does not support posing the joints in any way... Use with a SkeletonPose to describe a skeleton in a specific pose.
	 * @param {String} name Name of skeleton
	 * @property {String} name Name of skeleton
	 */
	function Skeleton(name, joints) {
		this._name = name;
		this._joints = joints;
	}

	return Skeleton;
});
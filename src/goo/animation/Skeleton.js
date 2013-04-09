define([
	'goo/animation/Joint'
],
/** @lends */
function (
	Joint
) {
	"use strict";

	/**
	 * @class Describes a collection of Joints. This class represents the hierarchy of a Skeleton and its original aspect (via the Joint class). This
	 *        does not support posing the joints in any way... Use with a SkeletonPose to describe a skeleton in a specific pose.
	 * @param {String} name Name of skeleton
	 * @property {String} name Name of skeleton
	 */
	function Skeleton (name, joints) {
		this._name = name;
		this._joints = joints;
	}

	Skeleton.prototype.copy = function() {
		var name = this._name;
		var jointArray = this._joints;
		var joints = [];

		for (var j = 0, maxJ = jointArray.length; j < maxJ; j++) {
			var jointObj = jointArray[j];
			var jName = jointObj._name;
			var joint = new Joint(jName);

			joint._index = jointObj._index;
			joint._parentIndex = jointObj._parentIndex;
			joint._inverseBindPose.copy(jointObj._inverseBindPose);
			joint._inverseBindPose.update();
			joints[j] = joint;
		}
		return new Skeleton(name, joints);
	};
	return Skeleton;
});
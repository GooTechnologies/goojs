define([
	'goo/animation/Joint'
],
/** @lends */
function (
	Joint
) {
	"use strict";

	/**
	 * @class Describes a collection of Joints. This class represents the hierarchy of a Skeleton and its original aspect (via the {@link Joint} class). This
	 *        does not support posing the joints in any way... Use with a SkeletonPose to describe a skeleton in a specific pose.
	 * @param {String} name
	 * @param {Joint[]} joints
	 */
	function Skeleton (name, joints) {
		this._name = name;
		this._joints = joints;
		this._updateLocalTransforms();
	}

	Skeleton.prototype._updateLocalTransforms = function() {
		for (var i = 0; i < this._joints.length; i++) {
			var joint = this._joints[i];
			if (joint._parentIndex !== Joint.NO_PARENT) {
				var parentJoint = this._joints[joint._parentIndex];
				joint.computeLocalTransform(parentJoint._inverseBindPose);
			} else {
				joint.computeLocalTransform();
			}
		}
	};

	Skeleton.prototype._setLocalTransforms = function(localTransforms) {
		for (var i = 0; i < this._joints.length; i++) {
			var joint = this._joints[i];

			joint.localTransform = localTransforms[i];
		}
	};

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
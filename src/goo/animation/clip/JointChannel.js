define(['goo/animation/clip/TransformChannel', 'goo/animation/clip/JointData'], function (TransformChannel, JointData) {
	"use strict";

	JointChannel.prototype = Object.create(TransformChannel.prototype);

	/**
	 * @name JointChannel
	 * @class Transform animation channel, specifically geared towards describing the motion of skeleton joints.
	 */
	function JointChannel(jointName, jointIndex, times, rotations, translations, scales) {
		TransformChannel.call(this, JointChannel.JOINT_CHANNEL_NAME + jointIndex, times, rotations, translations, scales);

		this._jointName = jointName;
		this._jointIndex = jointIndex;
	}

	JointChannel.JOINT_CHANNEL_NAME = '_jnt';

	JointChannel.prototype.createStateDataObject = function () {
		return new JointData();
	};

	JointChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, jointData) {
		TransformChannel.prototype.setCurrentSample.call(this, sampleIndex, progressPercent, jointData);
		jointData._jointIndex = this._jointIndex;
	};

	JointChannel.prototype.getJointData = function (index, store) {
		var rVal = store ? store : new JointData();
		TransformChannel.prototype.getTransformData.call(this, index, rVal);
		rVal._jointIndex = this._jointIndex;
		return rVal;
	};

	return JointChannel;
});
define(['goo/animation/TransformChannel'], function(TransformChannel) {
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

	return JointChannel;
});
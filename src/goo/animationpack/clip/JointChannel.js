define([
	'goo/animationpack/clip/TransformChannel',
	'goo/animationpack/clip/JointData'
], function (
	TransformChannel,
	JointData
) {
	'use strict';

	/**
	 * Transform animation channel, specifically geared towards describing the motion of skeleton joints.
	 * @param {string} jointName our joint name.
	 * @param {number} jointIndex our joint index
	 * @param {number[]} times our time offset values.
	 * @param {number[]} rotations the rotations to set on this channel at each time offset.
	 * @param {number[]} translations the translations to set on this channel at each time offset.
	 * @param {number[]} scales the scales to set on this channel at each time offset.
	 */
	function JointChannel(jointIndex, jointName, times, rotations, translations, scales, blendType) {
		TransformChannel.call(this, jointName, times, rotations, translations, scales, blendType);

		this._jointName = jointName; // Joint has a name even though index is used for id, this can be used for debugging purposes.
		this._jointIndex = jointIndex;
	}

	JointChannel.prototype = Object.create(TransformChannel.prototype);

	/**
	 * @type {string}
	 * @readonly
	 * @default '_jnt'
	 */
	JointChannel.JOINT_CHANNEL_NAME = '_jnt';

	/*
	 * Creates a data item for this type of channel
	 * @returns {JointData}
	 */
	JointChannel.prototype.createStateDataObject = function () {
		return new JointData();
	};

	/*
	 * Applies the channels animation state to supplied data item
	 * @param {number} sampleIndex
	 * @param {number} progressPercent
	 * @param {JointData} value The data item to apply animation to
	 */
	JointChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, jointData) {
		TransformChannel.prototype.setCurrentSample.call(this, sampleIndex, progressPercent, jointData);
		jointData._jointIndex = this._jointIndex;
	};

	/**
	 * Apply a specific index of this channel to a {@link TransformData} object.
	 * @param {number} index the index to grab.
	 * @param {JointData} [store] the TransformData to store in. If null, a new one is created.
	 * @returns {JointData} our resulting TransformData.
	 */
	JointChannel.prototype.getData = function (index, store) {
		var rVal = store ? store : new JointData();
		TransformChannel.prototype.getData.call(this, index, rVal);
		rVal._jointIndex = this._jointIndex;
		return rVal;
	};

	return JointChannel;
});
define(['goo/animation/clip/JointChannel', 'goo/animation/clip/JointData', 'goo/math/Vector3', 'goo/math/Quaternion'], function (JointChannel,
	JointData, Vector3, Quaternion) {
	"use strict";

	/**
	 * @name ManagedTransformSource
	 * @class This tree source maintains its own source data, which can be modified directly using setJointXXX. This source is meant to be used for
	 *        controlling a particular joint or set of joints programatically. Originally implemented BlendTreeSource.
	 * @param sourceName optional: name of source we were initialized from, if given.
	 */
	function ManagedTransformSource(sourceName) {
		this._sourceName = sourceName ? sourceName : null;
		this._data = {};
	}

	ManagedTransformSource.prototype.resetClips = function (manager, globalStartTime) {
		; // ignore
	};

	ManagedTransformSource.prototype.setTime = function (globalTime, manager) {
		return true;
	};

	ManagedTransformSource.prototype.isActive = function (manager) {
		return true;
	};

	/**
	 * @description Set the local source transform data for a given joint index.
	 * @param jointIndex our joint index value.
	 * @param jointData the joint transform data. This object is copied into the local store.
	 */
	ManagedTransformSource.prototype.setJointTransformData = function (jointIndex, jointData) {
		var key = JointChannel.JOINT_CHANNEL_NAME + jointIndex;
		// reuse JointData object
		if (!this._data[key]) {
			this._data[key] = new JointData(jointData);
		} else {
			this._data[key].set(jointData);
		}
	};

	/**
	 * @description Sets a translation to the local transformdata for a given joint index.
	 * @param jointIndex our joint index value.
	 * @param translation the translation to set
	 */
	ManagedTransformSource.prototype.setJointTranslation = function (jointIndex, translation) {
		var key = JointChannel.JOINT_CHANNEL_NAME + jointIndex;
		if (!this._data[key]) {
			var jdata = new JointData();
			jdata._jointIndex = jointIndex;
			jdata._translation.set(translation);
			this._data[key] = jdata;
		} else {
			this._data[key]._translation.set(translation);
		}
	};

	/**
	 * @description Sets a scale to the local transformdata for a given joint index.
	 * @param jointIndex our joint index value.
	 * @param scale the scale to set
	 */
	ManagedTransformSource.prototype.setJointScale = function (jointIndex, scale) {
		var key = JointChannel.JOINT_CHANNEL_NAME + jointIndex;
		if (!this._data[key]) {
			var jdata = new JointData();
			jdata._jointIndex = jointIndex;
			jdata._scale.set(scale);
			this._data[key] = jdata;
		} else {
			this._data[key]._scale.set(scale);
		}
	};

	/**
	 * @description Sets a rotation to the local transformdata for a given joint index.
	 * @param jointIndex our joint index value.
	 * @param scale the rotation to set
	 */
	ManagedTransformSource.prototype.setJointRotation = function (jointIndex, rotation) {
		var key = JointChannel.JOINT_CHANNEL_NAME + jointIndex;
		if (!this._data[key]) {
			var jdata = new JointData();
			jdata._jointIndex = jointIndex;
			jdata._rotation.set(rotation);
			this._data[key] = jdata;
		} else {
			this._data[key]._rotation.set(rotation);
		}
	};

	/**
	 * @description Setup transform data on this source, using the first frame from a specific clip and jointNames from a specific pose.
	 * @param pose the pose to sample joints from
	 * @param clip the animation clip to pull data from
	 * @param jointNames the names of the joints to find indices of.
	 */
	ManagedTransformSource.prototype.initJointsByName = function (pose, clip, jointNames) {
		for (var i = 0, max = jointNames.length; i < max; i++) {
			var jointName = jointNames[i];
			var jointIndex = pose._skeleton.findJointByName(jointName);
			var jdata = new JointData();
			jdata._jointIndex = jointIndex;
			this.setJointTransformData(jointIndex, clip.findChannelByName(JointChannel.JOINT_CHANNEL_NAME + jointIndex).getJointData(0, jdata));
		}
	};

	/**
	 * @description Setup transform data for specific joints on this source, using the first frame from a given clip.
	 * @param clip the animation clip to pull data from
	 * @param jointIndices the indices of the joints to initialize data for.
	 */
	ManagedTransformSource.prototype.initJointsById = function (clip, jointIndices) {
		for (var i = 0, max = jointIndices.length; i < max; i++) {
			var jointIndex = jointIndices[i];
			var jdata = new JointData();
			jdata._jointIndex = jointIndex;
			this.setJointTransformData(jointIndex, clip.findChannelByName(JointChannel.JOINT_CHANNEL_NAME + jointIndex).getJointData(0, jdata));
		}
	};

	return ManagedTransformSource;
});
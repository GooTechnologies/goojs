goo.Joint = (function (Transform) {
	'use strict';

	/**
	 * Representation of a Joint in a Skeleton. Meant to be used within a specific Skeleton object.
	 * @param {string} name Name of joint
	 */
	function Joint (name) {
		this._name = name;

		this._index = 0;
		this._parentIndex = Joint.NO_PARENT;
		this._inverseBindPose = new Transform();
	}

	Joint.NO_PARENT = -32768;

	return Joint;
})(goo.Transform);
goo.Skeleton = (function (
	Joint
) {
	'use strict';

	/**
	 * Describes a collection of Joints. This class represents the hierarchy of a Skeleton and its original aspect (via the {@link Joint} class). This
	 *        does not support posing the joints in any way... Use with a SkeletonPose to describe a skeleton in a specific pose.
	 * @param {string} name
	 * @param {Array<Joint>} joints
	 */
	function Skeleton(name, joints) {
		this._name = name;
		this._joints = joints;
	}

	Skeleton.prototype.clone = function () {
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
})(goo.Joint);
goo.SkeletonPose = (function (
	Transform,
	Joint,
	Matrix4
) {
	'use strict';

	/**
	 * Joins a {@link Skeleton} with an array of {@link Joint} poses. This allows the skeleton to exist and be reused between multiple instances of poses.
	 * @param {Skeleton} skeleton
	 */
	function SkeletonPose(skeleton) {
		this._skeleton = skeleton;

		this._localTransforms = [];
		this._globalTransforms = [];
		this._matrixPalette = [];
		this._poseListeners = [];

		var jointCount = this._skeleton._joints.length;

		// init local transforms
		for (var i = 0; i < jointCount; i++) {
			this._localTransforms[i] = new Transform();
		}

		// init global transforms
		for (var i = 0; i < jointCount; i++) {
			this._globalTransforms[i] = new Transform();
		}

		// init palette
		for (var i = 0; i < jointCount; i++) {
			this._matrixPalette[i] = new Matrix4();
		}

		// start off in bind pose.
		this.setToBindPose();
	}

	/**
	 * Update our local joint transforms so that they reflect the skeleton in bind pose.
	 */
	SkeletonPose.prototype.setToBindPose = function () {
		for (var i = 0; i < this._localTransforms.length; i++) {
			// Set the localTransform to the inverted inverseBindPose, i e the bindpose
			this._localTransforms[i].matrix.copy(this._skeleton._joints[i]._inverseBindPose.matrix).invert();

			// At this point we are in model space, so we need to remove our parent's transform (if we have one.)
			var parentIndex = this._skeleton._joints[i]._parentIndex;
			if (parentIndex !== Joint.NO_PARENT) {
				// We remove the parent's transform simply by multiplying by its inverse bind pose.
				this._localTransforms[i].matrix.mul2(
					this._skeleton._joints[parentIndex]._inverseBindPose.matrix,
					this._localTransforms[i].matrix
				);
			}
		}
		this.updateTransforms();
	};

	/**
	 * Update the global and palette transforms of our posed joints based on the current local joint transforms.
	 */
	SkeletonPose.prototype.updateTransforms = function () {
		var joints = this._skeleton._joints;
		for (var i = 0, l = joints.length; i < l; i++) {
			var parentIndex = joints[i]._parentIndex;
			if (parentIndex !== Joint.NO_PARENT) {
				// We have a parent, so take us from local->parent->model space by multiplying by parent's local->model
				this._globalTransforms[i].matrix.mul2(
					this._globalTransforms[parentIndex].matrix,
					this._localTransforms[i].matrix
				);
			} else {
				// No parent so just set global to the local transform
				this._globalTransforms[i].matrix.copy(this._localTransforms[i].matrix);
			}

			/*
			 * At this point we have a local->model space transform for this joint, for skinning we multiply this by the
			 * joint's inverse bind pose (joint->model space, inverted). This gives us a transform that can take a
			 * vertex from bind pose (model space) to current pose (model space).
			 */
			this._matrixPalette[i].mul2(
				this._globalTransforms[i].matrix,
				joints[i]._inverseBindPose.matrix
			);
		}

		this.firePoseUpdated();
	};

	/*
	 * Notify any registered PoseListeners that this pose has been "updated".
	 */
	SkeletonPose.prototype.firePoseUpdated = function () {
		for (var i = this._poseListeners.length - 1; i >= 0; i--) {
			this._poseListeners[i].poseUpdated(this);
		}
	};

	SkeletonPose.prototype.clone = function () {
		return new SkeletonPose(this._skeleton);
	};

	return SkeletonPose;
})(goo.Transform,goo.Joint,goo.Matrix4);
goo.TransformData = (function (Quaternion, Vector3) {
	'use strict';

	/**
	 * Describes a relative transform as a Quaternion-Vector-Vector tuple. We use QVV to make it simpler to do LERP blending.
	 * @param {TransformData} [source] source to copy.
	 */
	function TransformData (source) {
		this._rotation = new Quaternion().copy(source ? source._rotation : Quaternion.IDENTITY);
		this._scale = new Vector3().copy(source ? source._scale : Vector3.ONE);
		this._translation = new Vector3().copy(source ? source._translation : Vector3.ZERO);
	}

	/*
	 * Applies the data from this transformdata to supplied transform
	 * @param {Transform}
	 */
	TransformData.prototype.applyTo = function (transform) {
		// No need to set to identity since we overwrite them all
		// transform.setIdentity();
		// TODO: matrix vs quaternion?
		transform.rotation.copyQuaternion(this._rotation);
		transform.scale.set(this._scale);
		transform.translation.set(this._translation);
		transform.update();
	};

	/**
	 * Copy the source's values into this transform data object.
	 * @param {TransformData} source our source to copy.
	 */
	TransformData.prototype.set = function (source) {
		this._rotation.copy(source._rotation);
		this._scale.copy(source._scale);
		this._translation.copy(source._translation);
	};

	/**
	 * Blend this TransformData with the given TransformData.
	 * @param {TransformData} blendTo The TransformData to blend to
	 * @param {number} blendWeight The blend weight
	 * @param {TransformData} store The TransformData store.
	 * @returns {TransformData} The blended transform.
	 */
	TransformData.prototype.blend = function (blendTo, blendWeight, store) {
		var tData = store ? store : new TransformData();

		tData._translation.set(this._translation).lerp(blendTo._translation, blendWeight);
		tData._scale.set(this._scale).lerp(blendTo._scale, blendWeight);
		Quaternion.slerp(this._rotation, blendTo._rotation, blendWeight, tData._rotation);
		return tData;
	};

	return TransformData;
})(goo.Quaternion,goo.Vector3);
goo.BinaryLerpSource = (function (
	MathUtils,
	TransformData
) {
	'use strict';

	/**
	 * Takes two blend sources and uses linear interpolation to merge {@link TransformData} values. If one of the sources is null, or does not have a
	 *        key that the other does, we disregard weighting and use the non-null side's full value. Source data that is not {@link TransformData}, {@link JointData} or float data is not
	 *        combined, rather A's value will always be used unless it is null.
	 * @param {(ClipSource|BinaryLerpSource|FrozenClipSource|ManagedTransformSource)} sourceA our first source.
	 * @param {(ClipSource|BinaryLerpSource|FrozenClipSource|ManagedTransformSource)} sourceB our second source.
	 * @param {number} blendKey A key into the related AnimationManager's values store for pulling blend weighting.
	 * @private
	 */
	function BinaryLerpSource(sourceA, sourceB, blendWeight) {
		this._sourceA = sourceA ? sourceA : null;
		this._sourceB = sourceB ? sourceB : null;
		this.blendWeight = blendWeight ? blendWeight : null;
	}

	/*
	 * @returns a source data mapping for the channels in this clip source
	 */
	BinaryLerpSource.prototype.getSourceData = function () {
		// grab our data maps from the two sources
		var sourceAData = this._sourceA ? this._sourceA.getSourceData() : null;
		var sourceBData = this._sourceB ? this._sourceB.getSourceData() : null;

		return BinaryLerpSource.combineSourceData(sourceAData, sourceBData, this.blendWeight);
	};

	/**
	 * Sets the current time and moves the {@link AnimationClipInstance} forward
	 * @param {number} globalTime
	 */
	BinaryLerpSource.prototype.setTime = function (globalTime) {
		// set our time on the two sub sources
		var activeA = false;
		var activeB = false;
		if (this._sourceA) {
			activeA = this._sourceA.setTime(globalTime);
		}
		if (this._sourceB) {
			activeB = this._sourceB.setTime(globalTime);
		}
		return activeA || activeB;
	};

	/**
	 * Sets start time of clipinstance. If set to current time, clip is reset
	 * @param {number} globalStartTime
	 */
	BinaryLerpSource.prototype.resetClips = function (globalStartTime) {
		// reset our two sub sources
		if (this._sourceA) {
			this._sourceA.resetClips(globalStartTime);
		}
		if (this._sourceB) {
			this._sourceB.resetClips(globalStartTime);
		}
	};

	BinaryLerpSource.prototype.shiftClipTime = function (shiftTime) {
		// reset our two sub sources
		if (this._sourceA) {
			this._sourceA.shiftClipTime(shiftTime);
		}
		if (this._sourceB) {
			this._sourceB.shiftClipTime(shiftTime);
		}
	};

	/**
	 * Sets the time scale for sources A and B
	 * @param {number} timeScale
	 */
	BinaryLerpSource.prototype.setTimeScale = function (timeScale) {
		this._sourceA.setTimeScale(timeScale);
		this._sourceB.setTimeScale(timeScale);
	};

	/**
	 * @returns {boolean} from calling the isActive method on sources A or B
	 */
	BinaryLerpSource.prototype.isActive = function () {
		var foundActive = false;
		if (this._sourceA) {
			foundActive = foundActive || this._sourceA.isActive();
		}
		if (this._sourceB) {
			foundActive = foundActive || this._sourceB.isActive();
		}
		return foundActive;
	};

	/**
	 * Blends two sourceData maps together
	 * @param {Object} sourceAData
	 * @param {Object} sourceBData
	 * @param {number} blendWeight
	 * @param {Object} [store] If store is supplied, the result is stored there
	 * @returns {Object} The blended result,
	 */
	BinaryLerpSource.combineSourceData = function (sourceAData, sourceBData, blendWeight, store) {
		if (!sourceBData) {
			return sourceAData;
		} else if (!sourceAData) {
			return sourceBData;
		}

		var rVal = store ? store : {};

		for (var key in sourceAData) {
			var dataA = sourceAData[key];
			var dataB = sourceBData[key];
			if (!isNaN(dataA)) {
				BinaryLerpSource.blendFloatValues(rVal, key, blendWeight, dataA, dataB);
				continue;
			} else if (!(dataA instanceof TransformData)) {
				// A will always override if not null.
				rVal[key] = dataA;
				continue;
			}

			// Grab the transform data for each clip
			if (dataB) {
				rVal[key] = dataA.blend(dataB, blendWeight, rVal[key]);
			} else {
				if (!rVal[key]) {
					rVal[key] = new dataA.constructor(dataA);
				} else {
					rVal[key].set(dataA);
				}
			}
		}
		for ( var key in sourceBData) {
			if (rVal[key]) {
				continue;
			}
			rVal[key] = sourceBData[key];
		}

		return rVal;
	};

	/**
	 * Blends two float values and stores them in rVal
	 * @param {Object} rVal The object in which to store result
	 * @param {string} key The key to object rVal, so rVal[key] is the store
	 * @param {number} blendWeight
	 * @param {Array<number>} dataA The float is wrapped in an array
	 * @param {Array<number>} dataB The float is wrapped in an array
	 */
	BinaryLerpSource.blendFloatValues = function (rVal, key, blendWeight, dataA, dataB) {
		if (isNaN(dataB)) {
			rVal[key] = dataA;
		} else {
			rVal[key] = MathUtils.lerp(blendWeight, dataA[0], dataB[0]);
		}
	};

	BinaryLerpSource.prototype.clone = function () {
		return new BinaryLerpSource (
			this._sourceA,
			this._sourceB,
			this._blendWeight
		);
	};

	return BinaryLerpSource;
})(goo.MathUtils,goo.TransformData);
goo.FrozenClipSource = (function () {
	'use strict';

	/**
	 * A blend tree node that does not update any clips or sources below it in the blend tree. This is useful for freezing an animation, often
	 *        for purposes of transitioning between two unrelated animations.
	 * @param {(ClipSource|BinaryLerpSource|FrozenClipSource|ManagedTransformSource)} source Our sub source.
	 * @param {number} frozenTime The time we are frozen at.
	 */
	function FrozenClipSource (source, frozenTime) {
		this._source = source;
		this._time = frozenTime;
	}

	/**
	 * @returns a source data mapping for the channels in this clip source
	 */
	FrozenClipSource.prototype.getSourceData = function () {
		return this._source.getSourceData();
	};

	/**
	 * Sets start time of clipinstance to 0, so frozenTime will calculate correctly
	 */
	FrozenClipSource.prototype.resetClips = function () {
		this._source.resetClips(0);
	};

	/**
	 * This will be called by a {@link SteadyState}, but will not update the animation, and will return true, to indicate animation is still active
	 */
	FrozenClipSource.prototype.setTime = function () {
		this._source.setTime(this._time);
		return true;
	};

	/**
	 * A FrozenTreeSource is always active
	 */
	FrozenClipSource.prototype.isActive = function () {
		return true;
	};

	/**
	* Set time scale
	*/
	FrozenClipSource.prototype.setTimeScale = function () {};

	/**
	 * @returns {FrozenClipSource}
	 */
	FrozenClipSource.prototype.clone = function () {
		var cloned = new FrozenClipSource(
			this._source.clone(),
			this._time
		);

		return cloned;
	};

	return FrozenClipSource;
})();
goo.AnimationClipInstance = (function (
	World
) {
	'use strict';

	/**
	 * Maintains state information about an instance of a specific animation clip, such as time scaling applied, active flag, start time of the
	 *        instance, etc.
	 */
	function AnimationClipInstance () {
		this._active = true;
		this._loopCount = 0;
		this._timeScale = 1.0;
		this._startTime = 0.0;
		this._prevClockTime = 0.0;
		this._prevUnscaledClockTime = 0.0;
		this._clipStateObjects = {};
	}

	/**
	 * Sets the timescale of the animation, speeding it up or slowing it down
	 * @param {number} scale
	 * @param {number} [globalTime=World.time]
	 */
	AnimationClipInstance.prototype.setTimeScale = function (scale, globalTime) {
		globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
		if (this._active && this._timeScale !== scale) {
			if (this._timeScale !== 0.0 && scale !== 0.0) {
				// move startTime to account for change in scale
				var now = globalTime;
				var timePassed = now - this._startTime;
				timePassed *= this._timeScale;
				timePassed /= scale;
				this._startTime = now - timePassed;
			} else if (this._timeScale === 0.0) {
				var now = globalTime;
				this._startTime = now - this._prevUnscaledClockTime;
			}
		}
		this._timeScale = scale;
	};

	/**
	 * Gives the corresponding data for a channel, to apply animations to
	 * @param {AbstractAnimationChannel} channel
	 * @returns {(TransformData|TriggerData|Array<number>)} the animation data item
	 */
	AnimationClipInstance.prototype.getApplyTo = function (channel) {
		var channelName = channel._channelName;
		var rVal = this._clipStateObjects[channelName];
		if (!rVal) {
			rVal = channel.createStateDataObject();
			this._clipStateObjects[channelName] = rVal;
		}
		return rVal;
	};

	AnimationClipInstance.prototype.clone = function () {
		var cloned = new AnimationClipInstance();

		cloned._active = this._active;
		cloned._loopCount = this._loopCount;
		cloned._timeScale = this._timeScale;

		return cloned;
	};

	return AnimationClipInstance;
})(goo.World);
goo.ClipSource = (function (
	MathUtils,
	AnimationClipInstance
) {
	'use strict';

	/**
	 * A blend tree leaf node that samples and returns values from the channels of an AnimationClip.
	 * @param {AnimationClip} clip the clip to use.
	 * @param {string} [filter] 'Exclude' or 'Include'
	 * @param {Array<string>} [channelNames]
	 */
	function ClipSource(clip, filter, channelNames) {
		this._clip = clip;
		this._clipInstance = new AnimationClipInstance();

		this._filterChannels = {};
		this._filter = null;
		this.setFilter(filter, channelNames);

		this._startTime = -Infinity;
		this._endTime = Infinity;
	}

	/**
	 * Sets the filter on the joints which the clipsource will affect
	 * @param {string} [filter] 'Exclude' or 'Include'
	 * @param {Array<string>} [channelNames]
	 */
	ClipSource.prototype.setFilter = function (filter, channelNames) {
		if (filter && channelNames) {
			this._filter = (['Exclude', 'Include'].indexOf(filter) > -1) ? filter : null;
			for (var i = 0; i < channelNames.length; i++) {
				this._filterChannels[channelNames[i]] = true;
			}
		} else {
			this._filter = null;
		}
	};

	/**
	 * Sets the current time and moves the {@link AnimationClipInstance} forward
	 * @param {number} globalTime
	 * @private
	 */
	ClipSource.prototype.setTime = function (globalTime) {
		var instance = this._clipInstance;
		if (typeof instance._startTime !== 'number') {
			instance._startTime = globalTime;
		}

		var clockTime;
		var duration;
		if (instance._active) {
			if (instance._timeScale !== 0.0) {
				instance._prevUnscaledClockTime = globalTime - instance._startTime;
				clockTime = instance._timeScale * instance._prevUnscaledClockTime;
				instance._prevClockTime = clockTime;
			} else {
				clockTime = instance._prevClockTime;
			}

			var maxTime = Math.min(this._clip._maxTime, this._endTime);
			var minTime = Math.max(this._startTime, 0);
			duration = maxTime - minTime;
			if (maxTime === -1) {
				return false;
			}

			// Check for looping
			if (maxTime !== 0) {
				if (instance._loopCount === -1) {
					if (clockTime < 0) {
						clockTime *= -1;
						clockTime %= duration;
						clockTime = duration - clockTime;
						clockTime += minTime;
					} else {
						clockTime %= duration;
						clockTime += minTime;
					}
				} else if (instance._loopCount > 0 && duration * instance._loopCount >= Math.abs(clockTime)) {
					// probably still the same?
					if (clockTime < 0) {
						clockTime *= -1;
						clockTime %= duration;
						clockTime = duration - clockTime;
						clockTime += minTime;
					} else {
						clockTime %= duration;
						clockTime += minTime;
					}
				}

				if (clockTime > maxTime || clockTime < minTime) {
					clockTime = MathUtils.clamp(clockTime, minTime, maxTime);
					// deactivate this instance of the clip
					instance._active = false;
				}
			}

			// update the clip with the correct clip local time.
			this._clip.update(clockTime, instance);
		}
		return instance._active;
	};

	/**
	 * Sets start time of clipinstance. If set to current time, clip is reset
	 * @param {number} globalTime
	 * @private
	 */
	ClipSource.prototype.resetClips = function (globalTime) {
		this._clipInstance._startTime = typeof globalTime !== 'undefined' ? globalTime : 0;
		this._clipInstance._active = true;
	};

	/**
	 * @private
	 */
	ClipSource.prototype.shiftClipTime = function (shiftTime) {
		this._clipInstance._startTime += shiftTime;
		this._clipInstance._active = true;  // ?
	};

	/**
	 * @private
	 */
	ClipSource.prototype.setTimeScale = function (timeScale) {
		this._clipInstance.setTimeScale(timeScale);
	};

	/**
	 * @returns {boolean} if clipsource is active
	 * @private
	 */
	ClipSource.prototype.isActive = function () {
		return this._clipInstance._active && (this._clip._maxTime !== -1);
	};

	/**
	 * @returns a source data mapping for the channels in this clip source
	 * @private
	 */
	ClipSource.prototype.getSourceData = function () {
		if (!this._filter || !this._filterChannels) {
			return this._clipInstance._clipStateObjects;
		}
		var cso = this._clipInstance._clipStateObjects;
		var rVal = {};

		var filter = (this._filter === 'Include');

		for (var key in cso) {
			if ((this._filterChannels[key] !== undefined) === filter) {
				rVal[key] = cso[key];
			}
		}
		return rVal;
	};

	/**
	 * @returns {ClipSource}
	 */
	ClipSource.prototype.clone = function () {
		var cloned = new ClipSource(this._clip);

		cloned._clipInstance = this._clipInstance.clone();

		cloned._filter = this._filter;

		for (var key in this._filterChannels) {
			cloned._filterChannels[key] = this._filterChannels[key];
		}

		cloned._startTime = this._startTime;
		cloned._endTime = this._endTime;

		return cloned;
	};

	return ClipSource;
})(goo.MathUtils,goo.AnimationClipInstance);
goo.AbstractAnimationChannel = (function (
	MathUtils
) {
	'use strict';

	/**
	 * Base class for animation channels. An animation channel describes a single element of an animation (such as the movement of a single
	 *        joint, or the play back of a specific sound, etc.) These channels are grouped together in an {@link AnimationClip} to describe a full animation.
	 * @param {string} channelName the name of our channel. This is immutable to this instance of the class.
	 * @param {Array<number>} times our time indices. Copied into the channel.
	 * @param {string} blendType the blendtype between transform keyframes of the channel. Defaults to AbstractAnimationChannel.BLENDTYPES.LINEAR
	 * @private
	 */
	function AbstractAnimationChannel (channelName, times, blendType) {
		this._blendType = blendType || AbstractAnimationChannel.BLENDTYPES.LINEAR;
		this._channelName = channelName;

		if ((times instanceof Array || times instanceof Float32Array) && times.length) {
			this._times = new Float32Array(times);
		} else {
			this._times = [];
		}

		this._lastStartFrame = 0;
	}

	AbstractAnimationChannel.BLENDTYPES = {};
	AbstractAnimationChannel.BLENDTYPES.LINEAR = 'Linear';
	AbstractAnimationChannel.BLENDTYPES.CUBIC = 'SCurve3';
	AbstractAnimationChannel.BLENDTYPES.QUINTIC = 'SCurve5';

	/*
	 * @returns {number} number of samples
	 */
	AbstractAnimationChannel.prototype.getSampleCount = function () {
		return this._times.length;
	};

	/*
	 * @returns {number} The last time sample of the animation channel
	 */
	AbstractAnimationChannel.prototype.getMaxTime = function () {
		return this._times.length ? this._times[this._times.length - 1] : 0;
	};

	/*
	 * Calculates which samples to use for extracting animation state, then applies the animation state to supplied data item.
	 * @param {number} clockTime
	 * @param {TransformData|TriggerData|number[]} applyTo
	 */
	AbstractAnimationChannel.prototype.updateSample = function (clockTime, applyTo) {
		var timeCount = this._times.length;

		if (!(timeCount)) {
			return;
		}
		// figure out what frames we are between and by how much
		var lastFrame = timeCount - 1;
		if (clockTime < 0 || timeCount === 1) {
			this.setCurrentSample(0, 0.0, applyTo);
		} else if (clockTime >= this._times[lastFrame]) {
			this.setCurrentSample(lastFrame, 0.0, applyTo);
		} else {
			var startFrame = 0;
			if (clockTime >= this._times[this._lastStartFrame]) {
				startFrame = this._lastStartFrame;
				for (var i = this._lastStartFrame; i < timeCount - 1; i++) {
					if (this._times[i] >= clockTime) {
						break;
					}
					startFrame = i;
				}
			} else {
				for (var i = 0; i < this._lastStartFrame; i++) {
					if (this._times[i] >= clockTime) {
						break;
					}
					startFrame = i;
				}
			}
			var progressPercent = (clockTime - this._times[startFrame]) / (this._times[startFrame + 1] - this._times[startFrame]);

			switch (this._blendType) {
				case AbstractAnimationChannel.BLENDTYPES.CUBIC:
					progressPercent = MathUtils.scurve3(progressPercent);
					break;
				case AbstractAnimationChannel.BLENDTYPES.QUINTIC:
					progressPercent = MathUtils.scurve5(progressPercent);
					break;
				default:
			}

			this.setCurrentSample(startFrame, progressPercent, applyTo);

			this._lastStartFrame = startFrame;
		}
	};

	return AbstractAnimationChannel;
})(goo.MathUtils);
goo.TransformChannel = (function (
	AbstractAnimationChannel,
	TransformData,
	Quaternion
) {
	'use strict';

	/**
	 * An animation channel consisting of a series of transforms interpolated over time.
	 * @param channelName our name.
	 * @param {Array} times our time offset values.
	 * @param {Array} rotations the rotations to set on this channel at each time offset.
	 * @param {Array} translations the translations to set on this channel at each time offset.
	 * @param {Array} scales the scales to set on this channel at each time offset.
	 */
	function TransformChannel(channelName, times, rotations, translations, scales, blendType) {
		AbstractAnimationChannel.call(this, channelName, times, blendType);

		if (rotations.length / 4 !== times.length || translations.length / 3 !== times.length || scales.length / 3 !== times.length) {
			throw new Error('All provided arrays must be the same length (accounting for type)! Channel: ' + channelName);
		}

		this._rotations = new Float32Array(rotations);
		this._translations = new Float32Array(translations);
		this._scales = new Float32Array(scales);
	}

	var tmpQuat = new Quaternion();
	var tmpQuat2 = new Quaternion();

	TransformChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	/*
	 * Creates a data item for this type of channel
	 * @returns {TransformData}
	 */
	TransformChannel.prototype.createStateDataObject = function () {
		return new TransformData();
	};

	/*
	 * Applies the channels animation state to supplied data item
	 * @param {number} sampleIndex
	 * @param {number} fraction
	 * @param {TransformData} value The data item to apply animation to
	 */

	TransformChannel.prototype.setCurrentSample = function (sampleIndex, fraction, applyTo) {
		var transformData = applyTo;

		// shortcut if we are fully on one sample or the next
		var index4A = sampleIndex * 4, index3A = sampleIndex * 3;
		var index4B = (sampleIndex + 1) * 4, index3B = (sampleIndex + 1) * 3;
		if (fraction === 0.0) {
			transformData._rotation.x = this._rotations[index4A + 0];
			transformData._rotation.y = this._rotations[index4A + 1];
			transformData._rotation.z = this._rotations[index4A + 2];
			transformData._rotation.w = this._rotations[index4A + 3];

			transformData._translation.x = this._translations[index3A + 0];
			transformData._translation.y = this._translations[index3A + 1];
			transformData._translation.z = this._translations[index3A + 2];

			transformData._scale.x = this._scales[index3A + 0];
			transformData._scale.y = this._scales[index3A + 1];
			transformData._scale.z = this._scales[index3A + 2];
			return;
		} else if (fraction === 1.0) {
			transformData._rotation.x = this._rotations[index4B + 0];
			transformData._rotation.y = this._rotations[index4B + 1];
			transformData._rotation.z = this._rotations[index4B + 2];
			transformData._rotation.w = this._rotations[index4B + 3];

			transformData._translation.x = this._translations[index3B + 0];
			transformData._translation.y = this._translations[index3B + 1];
			transformData._translation.z = this._translations[index3B + 2];

			transformData._scale.x = this._scales[index3B + 0];
			transformData._scale.y = this._scales[index3B + 1];
			transformData._scale.z = this._scales[index3B + 2];
			return;
		}

		// Apply (s)lerp and set in transform
		transformData._rotation.x = this._rotations[index4A + 0];
		transformData._rotation.y = this._rotations[index4A + 1];
		transformData._rotation.z = this._rotations[index4A + 2];
		transformData._rotation.w = this._rotations[index4A + 3];

		tmpQuat.x = this._rotations[index4B + 0];
		tmpQuat.y = this._rotations[index4B + 1];
		tmpQuat.z = this._rotations[index4B + 2];
		tmpQuat.w = this._rotations[index4B + 3];

		if (!transformData._rotation.equals(tmpQuat)) {
			Quaternion.slerp(transformData._rotation, tmpQuat, fraction, tmpQuat2);
			transformData._rotation.set(tmpQuat2);
		}

		transformData._translation.setDirect(
			(1 - fraction) * this._translations[index3A + 0] + fraction * this._translations[index3B + 0],
			(1 - fraction) * this._translations[index3A + 1] + fraction * this._translations[index3B + 1],
			(1 - fraction) * this._translations[index3A + 2] + fraction * this._translations[index3B + 2]
		);

		transformData._scale.setDirect(
			(1 - fraction) * this._scales[index3A + 0] + fraction * this._scales[index3B + 0],
			(1 - fraction) * this._scales[index3A + 1] + fraction * this._scales[index3B + 1],
			(1 - fraction) * this._scales[index3A + 2] + fraction * this._scales[index3B + 2]
		);
	};

	/**
	 * Apply a specific index of this channel to a {@link TransformData} object.
	 * @param {number} index the index to grab.
	 * @param {TransformData} [store] the TransformData to store in. If null, a new one is created.
	 * @returns {TransformData} our resulting TransformData.
	 */
	TransformChannel.prototype.getData = function (index, store) {
		var rVal = store ? store : new TransformData();
		this.setCurrentSample(index, 0.0, rVal);
		return rVal;
	};

	return TransformChannel;
})(goo.AbstractAnimationChannel,goo.TransformData,goo.Quaternion);
goo.JointData = (function (
	TransformData
) {
	'use strict';

	/**
	 * Describes transform of a joint.
	 * @param {JointData} [source] source to copy
	 */
	function JointData (source) {
		TransformData.call(this, source);
		this._jointIndex = source ? source._jointIndex : 0;
	}

	JointData.prototype = Object.create(TransformData.prototype);
	JointData.prototype.constructor = JointData;

	/**
	 * Copy the jointData's values into this transform data object.
	 * @param {JointData} jointData our source to copy. Must not be null.
	 */
	JointData.prototype.set = function (jointData) {
		TransformData.prototype.set.call(this, jointData);
		this._jointIndex = jointData._jointIndex;
	};

	/**
	 * Blend this transform with the given transform.
	 * @param {TransformData} blendTo The transform to blend to
	 * @param {number} blendWeight The blend weight
	 * @param {TransformData} store The transform store.
	 * @returns {TransformData} The blended transform.
	 */
	JointData.prototype.blend = function (blendTo, blendWeight, store) {
		var rVal = store;
		if (!rVal) {
			rVal = new JointData();
			rVal._jointIndex = this._jointIndex;
		} else if (rVal instanceof JointData) {
			rVal._jointIndex = this._jointIndex;
		}
		return TransformData.prototype.blend.call(this, blendTo, blendWeight, rVal);
	};

	JointData.prototype.clone = function () {
		return new JointData(this);
	};

	return JointData;
})(goo.TransformData);
goo.JointChannel = (function (
	TransformChannel,
	JointData
) {
	'use strict';

	/**
	 * Transform animation channel, specifically geared towards describing the motion of skeleton joints.
	 * @param {string} jointName our joint name.
	 * @param {number} jointIndex our joint index
	 * @param {Array<number>} times our time offset values.
	 * @param {Array<number>} rotations the rotations to set on this channel at each time offset.
	 * @param {Array<number>} translations the translations to set on this channel at each time offset.
	 * @param {Array<number>} scales the scales to set on this channel at each time offset.
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
})(goo.TransformChannel,goo.JointData);
goo.ManagedTransformSource = (function (
	JointChannel,
	JointData,
	TransformChannel,
	TransformData,
	Vector3,
	Quaternion
) {
	'use strict';

	/**
	 * This tree source maintains its own source data, which can be modified directly using instance functions. This source is meant to be used for
	 *        controlling a particular joint or set of joints programatically.
	 * @param {string} [sourceName] Name of source we were initialized from, if given.
	 */
	function ManagedTransformSource(sourceName) {
		this._sourceName = sourceName ? sourceName : null;
		this._data = {};
	}

	/**
	 * Sets a translation to the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Vector3} translation the translation to set
	 */
	ManagedTransformSource.prototype.setTranslation = function (channelName, translation) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			channel._translation.set(translation);
		}
	};

	/**
	 * Gets the translation of the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Vector3} [store] to store the result in
	 * @returns new Vector3 with result or store
	 */
	ManagedTransformSource.prototype.getTranslation = function (channelName, store) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			store = store || new Vector3();
			store.set(channel._translation);
		}
		return store;
	};

	/**
	 * Sets a scale to the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Vector3} scale the scale to set
	 */
	ManagedTransformSource.prototype.setScale = function (channelName, scale) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			channel._scale.set(scale);
		}
	};

	/**
	 * Gets the scale from the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Vector3} [store] to store the result in
	 * @returns {Vector3} new vector with result or store
	 */
	ManagedTransformSource.prototype.getScale = function (channelName, store) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			store = store || new Vector3();
			store.set(channel._scale);
		}
		return store;
	};

	/**
	 * Sets a rotation to the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Quaternion} rotation the rotation to set
	 */
	ManagedTransformSource.prototype.setRotation = function (channelName, rotation) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			channel._rotation.set(rotation);
		}
	};

	/**
	 * Gets rotation from the local transformdata for a given channelName. The channel has to be an instance of {@link TransformChannel}
	 * @param {string} channelName
	 * @param {Quaternion} [store] to store the result in
	 */
	ManagedTransformSource.prototype.getRotation = function (channelName, store) {
		var channel = this._data[channelName];
		if (channel instanceof TransformData) {
			store = store || new Quaternion();
			store.set(channel._rotation);
		}
		return store;
	};

	/**
	 * Setup transform data for specific joints on this source, using the first frame from a given clip.
	 * @param {AnimationClip} clip the animation clip to pull data from
	 * @param {Array<string>} jointIndices the indices of the joints to initialize data for.
	 */
	ManagedTransformSource.prototype.initFromClip = function (clip, filter, channelNames) {
		if (filter === 'Include' && channelNames && channelNames.length) {
			for ( var i = 0, max = channelNames.length; i < max; i++) {
				var channelName = channelNames[i];
				var channel = clip.findChannelByName(channelName);
				if (channel) {
					var data = channel.getData(0);
					this._data[channelName] = data;
				} else {
					console.error('Channel not in clip: ' + channelName);
				}
			}
		} else {
			for ( var i = 0, max = clip._channels.length; i < max; i++) {
				var channel = clip._channels[i];
				var channelName = channel._channelName;
				if (filter === 'Exclude'
					&& channelNames
					&& channelNames.length
					&& channelNames.indexOf(channelName) > -1
				) {
					var data = channel.getData(0);
					this._data[channelName] = data;
				}
			}
		}
	};

	/*
	 * This has no effect on clip source, but will be called by owning {@link SteadyState}
	 */
	ManagedTransformSource.prototype.resetClips = function () {
	};

	ManagedTransformSource.prototype.setTimeScale = function () {
	};

	/*
	 * This has no effect, but will be called by owning {@link SteadyState}
	 * @returns true to stay active
	 */
	ManagedTransformSource.prototype.setTime = function () {
		return true;
	};

	/*
	 * ManagedTransformSource is always active
	 */
	ManagedTransformSource.prototype.isActive = function () {
		return true;
	};

	ManagedTransformSource.prototype.getChannelData = function (channelName) {
		return this._data[channelName];
	};

	/*
	 * @returns a source data mapping for the channels in this clip source
	 */
	ManagedTransformSource.prototype.getSourceData = function () {
		return this._data;
	};


	/**
	* @returns {ManagedTransformSource}
	*/
	ManagedTransformSource.prototype.clone = function () {
		var clonedData = {};
		for (var key in this._data) {
			clonedData[key] = this._data[key].clone();
		}

		return new ManagedTransformSource(this._sourceName, clonedData);
	};

	return ManagedTransformSource;
})(goo.JointChannel,goo.JointData,goo.JointChannel,goo.JointData,goo.Vector3,goo.Quaternion);
goo.AnimationClip = (function () {
	'use strict';

	/**
	 * AnimationClip manages a set of animation channels as a single clip entity.
	 * @param {string} name Name of joint
	 * @param {Array<AbstractAnimationChannel>} [channels=[]] an array of channels to shallow copy locally.
	 */
	function AnimationClip (name, channels) {
		this._name = name;
		this._channels = channels || [];
		this._maxTime = -1;
		this.updateMaxTimeIndex();
	}

	/*
	 * Update an instance of this clip.
	 * @param {number} clockTime the current local clip time (where 0 == start of clip)
	 * @param {AnimationClipInstance} instance the instance record to update.
	 */
	AnimationClip.prototype.update = function (clockTime, instance) {
		// Go through each channel and update clipState
		for ( var i = 0, max = this._channels.length; i < max; ++i) {
			var channel = this._channels[i];
			var applyTo = instance.getApplyTo(channel);
			channel.updateSample(clockTime, applyTo);
		}
	};

	/**
	 * Add a channel to this clip.
	 * @param {AbstractAnimationChannel} channel the channel to add.
	 */
	AnimationClip.prototype.addChannel = function (channel) {
		this._channels.push(channel);
		this.updateMaxTimeIndex();
	};

	/**
	 * Remove a given channel from this clip.
	 * @param {AbstractAnimationChannel} channel the channel to remove.
	 * @returns {boolean} true if this clip had the given channel and it was removed.
	 */
	AnimationClip.prototype.removeChannel = function (channel) {
		var idx = this._channels.indexOf(channel);
		if (idx >= 0) {
			this._channels.splice(idx, 1);
			this.updateMaxTimeIndex();
			return true;
		}
		return false;
	};

	/**
	 * Locate a channel in this clip using its channel name.
	 * @param {string} channelName the name to match against.
	 * @returns {AbstractAnimationChannel} the first channel with a name matching the given channelName, or null if no matches are found.
	 */
	AnimationClip.prototype.findChannelByName = function (channelName) {
		for ( var i = 0, max = this._channels.length; i < max; ++i) {
			var channel = this._channels[i];
			if (channelName === channel._channelName) {
				return channel;
			}
		}
		return null;
	};

	/*
	 * Update our max time value to match the max time in our managed animation channels.
	 */
	AnimationClip.prototype.updateMaxTimeIndex = function () {
		this._maxTime = -1;
		var max;
		for ( var i = 0; i < this._channels.length; i++) {
			var channel = this._channels[i];
			max = channel.getMaxTime();
			if (max > this._maxTime) {
				this._maxTime = max;
			}
		}
	};

	AnimationClip.prototype.toString = function () {
		return this._name + ': '
			+ this._channels.map(function (channel) { return channel._channelName; });
	};

	return AnimationClip;
})();
goo.InterpolatedFloatChannel = (function (
	AbstractAnimationChannel,
	MathUtils
) {
	'use strict';

	/**
	 * An animation source channel consisting of float value samples. These samples are interpolated between key frames. Potential uses for
	 *        this channel include extracting and using forward motion from walk animations, animating colors or texture coordinates, etc.
	 * @param {string} channelName the name of this channel.
	 * @param {Array<number>} times the time samples
	 * @param {Array<number>} values our value samples. Entries may be null. Should have as many entries as the times array.
	 * @private
	 */
	function InterpolatedFloatChannel (channelName, times, values, blendType) {
		AbstractAnimationChannel.call(this, channelName, times, blendType);
		this._values = values ? values.slice(0) : null;
	}

	InterpolatedFloatChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	/*
	 * Creates a data item for this type of channel
	 * @returns {Array<number>}
	 */
	InterpolatedFloatChannel.prototype.createStateDataObject = function () {
		return [0.0];
	};

	/*
	 * Applies the channels animation state to supplied data item
	 * @param {number} sampleIndex
	 * @param {number} progressPercent
	 * @param {Array<number>} value The data item to apply animation to
	 */
	InterpolatedFloatChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, value) {
		value[0] = MathUtils.lerp(progressPercent, this._values[sampleIndex], this._values[sampleIndex + 1]);
	};

	/**
	 * Apply a specific index of this channel to a {@link TransformData} object.
	 * @param {number} index the index to grab.
	 * @param {Array<number>} [store] the TransformData to store in. If null, a new one is created.
	 * @returns {Array<number>} our resulting TransformData.
	 */
	InterpolatedFloatChannel.prototype.getData = function (index, store) {
		var rVal = store || [];
		rVal[0] = this._values[index];
		return rVal;
	};

	return InterpolatedFloatChannel;
})(goo.AbstractAnimationChannel,goo.MathUtils);
goo.TriggerData = (function () {
	'use strict';

	/**
	 * Transient class that maintains the current triggers and armed status for a {@link TriggerChannel}.
	 * @private
	 */
	function TriggerData () {
		this._currentTriggers = [];
		this._currentIndex = -1;
		this.armed = false;
	}

	/*
	 * Arms the data to be triggered on next animation loop
	 * @param {number} index The index of the data in the {@link TriggerChannel}, so we only trigger once per triggerdata
	 * @param {Array<string>} triggers String keys that will trigger callbacks in the {@link AnimationComponent}
	 */
	TriggerData.prototype.arm = function (index, triggers) {
		if (triggers === null || triggers.length === 0) {
			this._currentTriggers.length = 0;
			this.armed = false;
		} else if (index !== this._currentIndex) {
			this._currentTriggers.length = 0;
			for ( var i = 0, max = triggers.length; i < max; i++) {
				if (triggers[i] && triggers[i] !== '') {
					this._currentTriggers.push(triggers[i]);
				}
			}
			this.armed = true;
		}
		this._currentIndex = index;
	};

	return TriggerData;
})();
goo.TriggerChannel = (function (
	AbstractAnimationChannel,
	TriggerData
) {
	'use strict';

	/**
	 * An animation source channel consisting of keyword samples indicating when a specific trigger condition is met. Each channel can only be in one keyword "state" at a given moment in time.
	 * @param {string} channelName the name of this channel.
	 * @param {Array<number>} times the time samples
	 * @param {Array<string>} keys our key samples. Entries may be null. Should have as many entries as the times array.
	 * @private
	 */
	function TriggerChannel(channelName, times, keys, blendType) {
		AbstractAnimationChannel.call(this, channelName, times, blendType);
		this._keys = keys ? keys.slice(0) : null;
		this.guarantee = false;
	}

	TriggerChannel.prototype = Object.create(AbstractAnimationChannel.prototype);

	/**
	 * Creates a data item for this type of channel
	 * @returns {TriggerData}
	 */
	TriggerChannel.prototype.createStateDataObject = function () {
		return new TriggerData();
	};

	/**
	 * Applies the channels animation state to supplied data item
	 * @param {number} sampleIndex
	 * @param {number} progressPercent
	 * @param {TriggerData} value The data item to apply animation to
	 */
	TriggerChannel.prototype.setCurrentSample = function (sampleIndex, progressPercent, triggerData) {
		var oldIndex = triggerData._currentIndex;

		var newIndex = progressPercent !== 1.0 ? sampleIndex : sampleIndex + 1;

		if (oldIndex === newIndex || !this.guarantee) {
			triggerData.arm(newIndex, [this._keys[newIndex]]);
		} else {
			var triggers = [];
			if (oldIndex > newIndex) {
				for (var i = oldIndex + 1; i < this._keys.length; i++) {
					triggers.push(this._keys[i]);
				}
				oldIndex = -1;
			}
			for ( var i = oldIndex + 1; i <= newIndex; i++) {
				triggers.push(this._keys[i]);
			}
			triggerData.arm(newIndex, triggers);
		}
	};

	return TriggerChannel;
})(goo.AbstractAnimationChannel,goo.TriggerData);
goo.AbstractState = (function (
) {
	'use strict';

	/**
	 * Base class for a state in our animation system
	 * @private
	 */
	function AbstractState () {
		this._globalStartTime = 0;
		this.onFinished = null;
	}

	AbstractState.prototype.update = function () {};
	AbstractState.prototype.postUpdate = function () {};
	AbstractState.prototype.getCurrentSourceData = function () {};

	AbstractState.prototype.resetClips = function (globalTime) {
		this._globalStartTime = globalTime;
	};

	AbstractState.prototype.shiftClipTime = function (shiftTime) {
		this._globalStartTime += shiftTime;
	};

	return AbstractState;
})();
goo.AbstractTransitionState = (function (
	AbstractState,
	BinaryLerpSource,
	MathUtils
) {
	'use strict';

	/**
	 * An abstract transition state that blends between two other states.
	 * @extends AbstractState
	 * @private
	 */

	function AbstractTransitionState() {
		AbstractState.call(this);

		this._sourceState = null;
		this._targetState = null;
		this._percent = 0.0;
		this._sourceData = null;
		this._fadeTime = 0;
		this._blendType = AbstractTransitionState.BLENDTYPES.LINEAR;
	}

	AbstractTransitionState.prototype = Object.create(AbstractState.prototype);
	AbstractTransitionState.prototype.constructor = AbstractTransitionState;

	AbstractTransitionState.BLENDTYPES = {};
	AbstractTransitionState.BLENDTYPES.LINEAR = 'Linear';
	AbstractTransitionState.BLENDTYPES.CUBIC = 'SCurve3';
	AbstractTransitionState.BLENDTYPES.QUINTIC = 'SCurve5';

	/**
	 * Update this state using the current global time.
	 * @param {number} globalTime the current global time.
	 */
	// Was: function (globalTime, layer)
	AbstractTransitionState.prototype.update = function (globalTime) {
		var currentTime = globalTime - this._globalStartTime;
		if (currentTime > this._fadeTime && this.onFinished) {
			this.onFinished();
			return;
		}
		var percent = currentTime / this._fadeTime;
		switch (this._blendType) {
			case AbstractTransitionState.BLENDTYPES.CUBIC:
				this._percent = MathUtils.scurve3(percent);
				break;
			case AbstractTransitionState.BLENDTYPES.QUINTIC:
				this._percent = MathUtils.scurve5(percent);
				break;
			default:
				this._percent = percent;
		}
	};

	/**
	 * Method for setting fade time and blend type from config data.
	 * @param {Object} configuration data
	 */

	AbstractTransitionState.prototype.readFromConfig = function (config) {
		if (config) {
			if (config.fadeTime !== undefined) { this._fadeTime = config.fadeTime; }
			if (config.blendType !== undefined) { this._blendType = config.blendType; }
		}
	};

	/**
	 * @returns the current map of source channel data for this layer.
	 */
	AbstractTransitionState.prototype.getCurrentSourceData = function () {
		// grab our data maps from the two states
		var sourceAData = this._sourceState ? this._sourceState.getCurrentSourceData() : null;
		var sourceBData = this._targetState ? this._targetState.getCurrentSourceData() : null;

		// reuse previous _sourceData transforms to avoid re-creating
		// too many new transform data objects. This assumes that a
		// same state always returns the same transform data objects.
		if (!this._sourceData) {
			this._sourceData = {};
		}
		return BinaryLerpSource.combineSourceData(sourceAData, sourceBData, this._percent, this._sourceData);
	};

	/**
	 * Check if a transition is valid within a given time window.
	 *
	 * @param {Array} timeWindow start and end time
	 * @param {number} current world time
	 * @returns {boolean} true if transition is valid
	 */

	AbstractTransitionState.prototype.isValid = function (timeWindow, globalTime) {
		var localTime = globalTime - this._sourceState._globalStartTime;
		var start = timeWindow[0];
		var end = timeWindow[1];

		if (start <= 0) {
			if (end <= 0) {
				// no window, so true
				return true;
			} else {
				// just check end
				return localTime <= end;
			}
		} else {
			if (end <= 0) {
				// just check start
				return localTime >= start;
			} else if (start <= end) {
				// check between start and end
				return start <= localTime && localTime <= end;
			} else {
				// start is greater than end, so there are two windows.
				return localTime >= start || localTime <= end;
			}
		}
	};

	AbstractTransitionState.prototype.resetClips = function (globalTime) {
		AbstractState.prototype.resetClips.call(this, globalTime);
		//this._sourceData = {};
		this._percent = 0.0;
	};

	AbstractTransitionState.prototype.shiftClipTime = function (shiftTime) {
		AbstractState.prototype.shiftClipTime.call(this, shiftTime);
		//this._percent = 0.0;  // definitely not 0, or maybe 0
	};

	AbstractTransitionState.prototype.setTimeScale = function (timeScale) {
		if (this._sourceState) {
			this._sourceState.setTimeScale(timeScale);
		}
		if (this._targetState) {
			this._targetState.setTimeScale(timeScale);
		}
	};

	return AbstractTransitionState;
})(goo.AbstractState,goo.BinaryLerpSource,goo.MathUtils);
goo.FadeTransitionState = (function (
	AbstractTransitionState
) {
	'use strict';

	/**
	 * A transition that blends over a given time from one animation state to another, beginning the target clip from local time 0 at the start of the transition. This is best used with two clips that have similar motions.
	 * @extends AbstractTransitionState
	 */
	function FadeTransitionState() {
		AbstractTransitionState.call(this);
	}

	FadeTransitionState.prototype = Object.create(AbstractTransitionState.prototype);
	FadeTransitionState.prototype.constructor = FadeTransitionState;

	/**
	 * Update this state using the current global time.
	 * @param globalTime the current global time.
	 * @param layer the layer this state belongs to.
	 */
	FadeTransitionState.prototype.update = function (globalTime) {
		AbstractTransitionState.prototype.update.call(this, globalTime);

		// update both of our states
		if (this._sourceState) {
			this._sourceState.update(globalTime);
		}
		if (this._targetState) {
			this._targetState.update(globalTime);
		}
	};

	/**
	 * Post update. If the state has no more clips and no end transition, this will clear this state from the layer.
	 * @param layer the layer this state belongs to.
	 */
	FadeTransitionState.prototype.postUpdate = function () {
		// post update both of our states
		if (this._sourceState) {
			this._sourceState.postUpdate();
		}
		if (this._targetState) {
			this._targetState.postUpdate();
		}
	};

	FadeTransitionState.prototype.resetClips = function (globalTime) {
		AbstractTransitionState.prototype.resetClips.call(this, globalTime);
		if (this._targetState) {
			this._targetState.resetClips(globalTime);
		}
	};

	FadeTransitionState.prototype.shiftClipTime = function (shiftTime) {
		AbstractTransitionState.prototype.shiftClipTime.call(this, shiftTime);
		if (this._targetState) {
			this._targetState.shiftClipTime(shiftTime);
		}
		if (this._sourceState) {
			this._sourceState.shiftClipTime(shiftTime);
		}
	};

	return FadeTransitionState;
})(goo.AbstractTransitionState);
goo.SyncFadeTransitionState = (function (
	FadeTransitionState
) {
	'use strict';

	/**
	 * A transition that blends over a given time from one animation state to another, synchronizing the target state to the initial state's start time. This is best used with two clips that have similar motions.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function SyncFadeTransitionState() {
		FadeTransitionState.call(this);
	}

	SyncFadeTransitionState.prototype = Object.create(FadeTransitionState.prototype);
	SyncFadeTransitionState.prototype.constructor = SyncFadeTransitionState;

	SyncFadeTransitionState.prototype.resetClips = function (globalTime) {
		FadeTransitionState.prototype.resetClips.call(this, globalTime);
		this._targetState.resetClips(this._sourceState._globalStartTime);
	};

	SyncFadeTransitionState.prototype.shiftClipTime = function (shiftTime) {
		FadeTransitionState.prototype.shiftClipTime.call(this, shiftTime);
		this._targetState.shiftClipTime(this._sourceState._globalStartTime + shiftTime);
		this._sourceState.shiftClipTime(shiftTime);
	};

	return SyncFadeTransitionState;
})(goo.FadeTransitionState);
goo.FrozenTransitionState = (function (
	AbstractTransitionState
) {
	'use strict';

	/**
	 * A two state transition that freezes the starting state at its current position and blends that over time with a target state. The target
	 *        state moves forward in time during the blend as normal.
	 */
	function FrozenTransitionState () {
		AbstractTransitionState.call(this);
	}

	FrozenTransitionState.prototype = Object.create(AbstractTransitionState.prototype);
	FrozenTransitionState.prototype.constructor = FrozenTransitionState;

	/**
	 * Update this state using the current global time.
	 * @param {number} globalTime the current global time.
	 */
	FrozenTransitionState.prototype.update = function (globalTime) {
		AbstractTransitionState.prototype.update.call(this, globalTime);

		// update only the target state - the source state is frozen
		if (this._targetState) {
			this._targetState.update(globalTime);
		}
	};

	/**
	 * Post update. If the state has no more clips and no end transition, this will clear this state from the layer.
	 * @param layer the layer this state belongs to.
	 */
	FrozenTransitionState.prototype.postUpdate = function () {
		// update only the B state - the first is frozen
		if (this._targetState) {
			this._targetState.postUpdate();
		}
	};

	/**
	 * Resets the clips to start at given time
	 * @param {number} globalTime
	 */
	FrozenTransitionState.prototype.resetClips = function (globalTime) {
		AbstractTransitionState.prototype.resetClips.call(this, globalTime);
		this._targetState.resetClips(globalTime);
	};

	FrozenTransitionState.prototype.shiftClipTime = function (shiftTime) {
		AbstractTransitionState.prototype.shiftClipTime.call(this, shiftTime);
		this._targetState.shiftClipTime(shiftTime);
	};

	return FrozenTransitionState;
})(goo.AbstractTransitionState);
goo.SteadyState = (function (
	AbstractState
) {
	'use strict';

	/**
	 * A "steady" state is an animation state that is concrete and stand-alone (vs. a state that handles transitioning between two states, for example.)
	 * @extends AbstractState
	 * @param {string} name Name of state
	 */
	function SteadyState(name) {
		AbstractState.call(this);

		this.id = null;
		this._name = name;
		this._transitions = {};
		this._sourceTree = null;
	}

	SteadyState.prototype = Object.create(AbstractState.prototype);
	SteadyState.prototype.constructor = SteadyState;

	/**
	 * Sets the clipsource of the steadystate
	 * @param {(ClipSource|BinaryLerpSource|FrozenClipSource|ManagedTransformSource)} clipSource
	 */
	SteadyState.prototype.setClipSource = function (clipSource) {
		this._sourceTree = clipSource;
	};

	/*
	 * Updates the states clip instances
	 */
	SteadyState.prototype.update = function (globalTime) {
		if (!this._sourceTree.setTime(globalTime)) {
			if (this.onFinished) {
				this.onFinished();
			}
		}
	};

	/*
	 * Gets the current animation data, used in {@link AnimationLayer}
	 */
	SteadyState.prototype.getCurrentSourceData = function () {
		return this._sourceTree.getSourceData();
	};

	/*
	 * Resets the animationclips in the sourcetree
	 * @param {number} globalStartTime Usually current time
	 */
	SteadyState.prototype.resetClips = function (globalStartTime) {
		AbstractState.prototype.resetClips.call(this, globalStartTime);
		this._sourceTree.resetClips(globalStartTime);
	};

	SteadyState.prototype.shiftClipTime = function (shiftTime) {
		AbstractState.prototype.shiftClipTime.call(this, shiftTime);
		this._sourceTree.shiftClipTime(shiftTime);
	};

	SteadyState.prototype.setTimeScale = function (timeScale) {
		this._sourceTree.setTimeScale(timeScale);
	};

	SteadyState.prototype.clone = function () {
		var cloned = new SteadyState(this._name);

		for (var key in this._transitions) {
			cloned._transitions[key] = this._transitions[key];
		}

		cloned._sourceTree = this._sourceTree.clone();

		return cloned;
	};

	return SteadyState;
})(goo.AbstractState);
goo.LayerLerpBlender = (function (
	BinaryLerpSource
) {
	'use strict';

	/**
	 * A layer blender that uses linear interpolation to merge the results of two layers.
	 */
	function LayerLerpBlender() {
		this._blendWeight = null;
		this._layerA = null;
		this._layerB = null;
	}

	/**
	 * @returns a key-value map representing the blended data from both animation layers.
	 */
	LayerLerpBlender.prototype.getBlendedSourceData = function () {
		// grab our data maps from the two layers...
		// set A
		var sourceAData = this._layerA.getCurrentSourceData();
		// set B
		var sourceBData = this._layerB._currentState ? this._layerB._currentState.getCurrentSourceData() : null;

		return BinaryLerpSource.combineSourceData(sourceAData, sourceBData, this._blendWeight);
	};

	return LayerLerpBlender;
})(goo.BinaryLerpSource);
goo.AnimationLayer = (function (
	FadeTransitionState,
	SyncFadeTransitionState,
	FrozenTransitionState,
	SteadyState,
	LayerLerpBlender,
	World,
	MathUtils
) {
	'use strict';

	/**
	 * Animation layers are essentially independent state machines, managed by a single AnimationManager. Each maintains a set of possible
	 *        "steady states" - main states that the layer can be in. The layer can only be in one state at any given time. It may transition between
	 *        states, provided that a path is defined for transition from the current state to the desired one. *
	 * @param {string} name Name of layer
	 * @param {string} id Id of layer
	 */
	function AnimationLayer(name, id) {
		this.id = id;
		this._name = name;

		this._steadyStates = {};
		this._currentState = null;
		this._layerBlender = new LayerLerpBlender();
		this._transitions = {};
		this._transitionStates = {};
	}

	AnimationLayer.BASE_LAYER_NAME = '-BASE_LAYER-';

	/**
	 * Get available states for layer
	 * @returns {Array<string>}
	 */
	AnimationLayer.prototype.getStates = function () {
		return Object.keys(this._steadyStates);
	};

	/**
	 * Add a state to the layer with the associated stateKey
	 * @param {string} stateKey
	 * @param {SteadyState} state
	 */
	AnimationLayer.prototype.setState = function (stateKey, state) {
		this._steadyStates[stateKey] = state;
	};

	/**
	 * Sets the blend weight of a layer. This will not affect the base
	 * layer in the animation component.
	 * @param {number} weight Should be between 0 and 1 and will be clamped
	 */
	AnimationLayer.prototype.setBlendWeight = function (weight) {
		if (this._layerBlender) {
			this._layerBlender._blendWeight = MathUtils.clamp(weight, 0, 1);
		}
	};

	/**
	 * Get available transitions for current State
	 * @returns {Array<string>}
	 */
	AnimationLayer.prototype.getTransitions = function () {
		var transitions;
		if (this._currentState) {
			transitions = Object.keys(this._currentState._transitions);
		} else {
			transitions = [];
		}
		if (this._transitions) {
			for (var key in this._transitions) {
				if (transitions.indexOf(key) === -1) {
					transitions.push(key);
				}
			}
		}
		transitions.sort();
		return transitions;
	};

	/**
	 * Does the updating before animations are applied
	 * @private
	 */
	AnimationLayer.prototype.update = function (globalTime) {
		if (this._currentState) {
			this._currentState.update(typeof globalTime !== 'undefined' ? globalTime : World.time);
		}
	};

	/**
	 * Does the updating after animations are applied
	 * @private
	 */
	AnimationLayer.prototype.postUpdate = function () {
		if (this._currentState) {
			this._currentState.postUpdate();
		}
	};

	/**
	 * Transition the layer to another state. The transition must be specified either on the state or on the layer (as a general transition), see FileFormat spec for more info
	 * @param {string} state
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 * @param {Function} finishCallback If the target state has a limited number of repeats, this callback is called when the animation finishes.
	 * @returns {boolean} true if a transition was found and started
	 */
	AnimationLayer.prototype.transitionTo = function (state, globalTime, finishCallback) {
		globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
		var cState = this._currentState;
		var transition;
		if (this._steadyStates[state] === cState) {
			return false;
		}
		if (!this._steadyStates[state]) {
			return false;
		}

		if (cState && cState._transitions) {
			transition = cState._transitions[state] || cState._transitions['*'];
		}
		if (!transition && this._transitions) {
			transition = this._transitions[state] || this._transitions['*'];
		}
		if (cState instanceof SteadyState && transition) {
			var transitionState = this._getTransitionByType(transition.type);
			this._doTransition(transitionState, cState, this._steadyStates[state], transition, globalTime, finishCallback);
			return true;
		} else if (!cState) {
			transition = this._transitions[state];
			if (transition) {
				var transitionState = this._getTransitionByType(transition.type);
				if (transitionState) {
					this._doTransition(transitionState, null, this._steadyStates[state], transition, globalTime, finishCallback);
					return true;
				}
			}
		}
		return false;
	};

	AnimationLayer.prototype._doTransition = function (transition, source, target, config, globalTime, finishCallback) {
		if (source) {
			transition._sourceState = source;
			var timeWindow = config.timeWindow || [-1, -1];
			if (!transition.isValid(timeWindow, globalTime)) {
				console.warn('State not in allowed time window');
				return;
			}
			source.onFinished = null;
		}
		transition._targetState = target;
		transition.readFromConfig(config);

		this.setCurrentState(transition, true, globalTime, finishCallback);
	};

	/**
	 * Sets the current state to the given state. Generally for transitional state use.
	 * @param {AbstractState} state our new state. If null, then no state is currently set on this layer.
	 * @param {boolean} [rewind=false] if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 * @param {Function} finishCallback If the target state has a limited number of repeats, this callback is called when the animation finishes.
	 */
	AnimationLayer.prototype.setCurrentState = function (state, rewind, globalTime, finishCallback) {
		globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;
		this._currentState = state;
		if (state) {
			if (rewind) {
				state.resetClips(globalTime);
			}
			state.onFinished = function () {
				this.setCurrentState(state._targetState || null, false, undefined, finishCallback);
				if (state instanceof SteadyState && finishCallback instanceof Function) {
					finishCallback();
				}
				this.update();
			}.bind(this);
		}
	};

	/**
	 * Get the current state
	 * @returns {AbstractState}
	 */
	AnimationLayer.prototype.getCurrentState = function () {
		return this._currentState;
	};

	/**
	 * Set the current state by state id.
	 * @param {string} id
	 * @param {boolean} [rewind=false] if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 * @param {Function} callback If the target state has a limited number of repeats, this callback is called when the animation finishes.
	 */
	AnimationLayer.prototype.setCurrentStateById = function (id, rewind, globalTime, callback) {
		var state = this.getStateById(id);
		this.setCurrentState(state, rewind, globalTime, callback);
	};

	/**
	 * Get the current state by id.
	 * @param {string} id
	 * @returns {AbstractState}
	 */
	AnimationLayer.prototype.getStateById = function (id) {
		return this._steadyStates[id];
	};

	/**
	 * Get the current state by name.
	 * @param {string} name
	 * @returns {AbstractState}
	 */
	AnimationLayer.prototype.getStateByName = function (name) {
		for (var id in this._steadyStates) {
			var state = this._steadyStates[id];
			if (state._name === name) {
				return this._steadyStates[id];
			}
		}
	};

	/**
	 * Force the current state of the machine to the state with the given name.
	 * @param {AbstractState} stateName the name of our state. If null, or is not present in this state machine, the current state is not changed.
	 * @param {boolean} rewind if true, the clip(s) in the given state will be rewound by setting its start time to the current time and setting it active.
	 * @param {number} [globalTime=World.time] start time for the transition, defaults to current time
	 * @returns {boolean} true if succeeds
	 */
	AnimationLayer.prototype.setCurrentStateByName = function (stateName, rewind, globalTime) {
		if (stateName) {
			var state = this.getStateByName(stateName);
			if (state) {
				this.setCurrentState(state, rewind, globalTime);
				return true;
			} else {
				console.warn('unable to find SteadyState named: ' + stateName);
			}
		}
		return false;
	};

	/**
	 * @returns a source data mapping for the channels involved in the current state/transition of this layer.
	 */
	AnimationLayer.prototype.getCurrentSourceData = function () {
		if (this._layerBlender) {
			return this._layerBlender.getBlendedSourceData();
		}

		if (this._currentState) {
			return this._currentState.getCurrentSourceData();
		} else {
			return null;
		}
	};
	/**
	 * Update the layer blender in this animation layer to properly point to the previous layer.
	 * @param {Object} previousLayer the layer before this layer in the animation manager.
	 * @private
	 */
	AnimationLayer.prototype.updateLayerBlending = function (previousLayer) {
		if (this._layerBlender) {
			this._layerBlender._layerA = previousLayer;
			this._layerBlender._layerB = this;
		}
	};

	/**
	 * Set the currently playing state on this layer to null.
	 */
	AnimationLayer.prototype.clearCurrentState = function () {
		this.setCurrentState(null);
	};

	AnimationLayer.prototype.resetClips = function (globalTime) {
		if (this._currentState) {
			this._currentState.resetClips(typeof globalTime !== 'undefined' ? globalTime : World.time);
		}
	};

	AnimationLayer.prototype.shiftClipTime = function (shiftTime) {
		if (this._currentState) {
			this._currentState.shiftClipTime(typeof shiftTime !== 'undefined' ? shiftTime : 0);
		}
	};

	AnimationLayer.prototype.setTimeScale = function (timeScale) {
		if (this._currentState) {
			this._currentState.setTimeScale(timeScale);
		}
	};

	AnimationLayer.prototype._getTransitionByType = function (type) {
		if (this._transitionStates[type]) { return this._transitionStates[type]; }
		var transition;
		switch (type) {
			case 'Fade':
				transition = new FadeTransitionState();
				break;
			case 'SyncFade':
				transition = new SyncFadeTransitionState();
				break;
			case 'Frozen':
				transition = new FrozenTransitionState();
				break;
			default:
				console.log('Defaulting to frozen transition type');
				transition = new FrozenTransitionState();
		}
		return this._transitionStates[type] = transition;
	};

	/**
	 * @returns {AnimationLayer}
	 */
	AnimationLayer.prototype.clone = function () {
		var cloned = new AnimationLayer(this._name);


		for (var key in this._steadyStates) {
			cloned._steadyStates[key] = this._steadyStates[key].clone();
			if (this._steadyStates[key] === this._currentState) {
				cloned._currentState = cloned._steadyStates[key];
			}
		}

		for (var key in this._transitions) {
			cloned._transitions[key] = this._transitions[key];
		}

		for (var key in this._transitionStates) {
			cloned._transitionStates[key] = new this._transitionStates[key].constructor();
		}

		return cloned;
	};

	return AnimationLayer;
})(goo.FadeTransitionState,goo.SyncFadeTransitionState,goo.FrozenTransitionState,goo.SteadyState,goo.LayerLerpBlender,goo.World,goo.MathUtils);
goo.AnimationComponent = (function (
	Component,
	World,
	AnimationLayer,
	JointData,
	TransformData,
	TriggerData
) {
	'use strict';

	/**
	 * Holds the animation data.
	 * @extends Component
	 * @param {SkeletonPose} pose pose
	 */
	function AnimationComponent(pose) {
		Component.apply(this, arguments);

		this.type = 'AnimationComponent';

		/**
		 * @type {Array<AnimationLayer>}
		 */
		this.layers = [];
		this.floats = {};

		this._updateRate = 1.0 / 60.0;
		this._lastUpdate = 0.0;
		this._triggerCallbacks = {};

		// Base layer
		var layer = new AnimationLayer(AnimationLayer.BASE_LAYER_NAME);
		this.layers.push(layer);
		this._skeletonPose = pose;

		this.paused = false;
		this.lastTimeOfPause = -1;
	}

	AnimationComponent.type = 'AnimationComponent';

	AnimationComponent.prototype = Object.create(Component.prototype);
	AnimationComponent.prototype.constructor = AnimationComponent;

	/**
	 * Transition to another state. This is shorthand for applying transitions on the base layer, see {@link AnimationLayer.transitionTo} for more info
	 * @param {string} stateKey
	 * @param {boolean} allowDirectSwitch Allow the function to directly switch state if transitioning fails (missing or transition already in progress)
	 * @param {Function} callback If the target state has a limited number of repeats, this callback is called when the animation finishes.
	 * @returns {boolean} true if a transition was found and started
	 */
	AnimationComponent.prototype.transitionTo = function (stateKey, allowDirectSwitch, callback) {
		if (this.layers[0].transitionTo(stateKey, undefined, callback)) {
			return true;
		}
		if (!allowDirectSwitch) {
			return false;
		}
		return this.layers[0].setCurrentStateById(stateKey, true, undefined, callback);
	};
	/**
	 * Get available states
	 * returns {Array<string>} available state keys
	 */
	AnimationComponent.prototype.getStates = function () {
		return this.layers[0].getStates();
	};
	AnimationComponent.prototype.getCurrentState = function () {
		return this.layers[0].getCurrentState();
	};
	/**
	 * Get available transitions
	 * returns {Array<string>} available state keys
	 */
	AnimationComponent.prototype.getTransitions = function () {
		return this.layers[0].getTransitions();
	};

	/*
	 * Update animations
	 */
	AnimationComponent.prototype.update = function (globalTime) {
		if (this.paused) {
			return;
		}

		// grab current global time
		globalTime = typeof globalTime !== 'undefined' ? globalTime : World.time;

		// check throttle
		if (this._updateRate !== 0.0) {
			if (globalTime > this._lastUpdate && globalTime - this._lastUpdate < this._updateRate) {
				return;
			}

			// we subtract a bit to maintain our desired rate, even if there are some gc pauses, etc.
			this._lastUpdate = globalTime - (globalTime - this._lastUpdate) % this._updateRate;
		}

		// move the time forward on the layers
		for (var i = 0, max = this.layers.length; i < max; i++) {
			this.layers[i].update(globalTime);
		}
	};

	/*
	 * Applying calculated animations to the concerned data
	 */
	AnimationComponent.prototype.apply = function (transformComponent) {
		var data = this.getCurrentSourceData();
		if (!data) { return; }

		var pose = this._skeletonPose;

		// cycle through, pulling out and applying those we know about
		var keys = Object.keys(data);
		for (var i = 0, l = keys.length; i < l; i++) {
			var key = keys[i];
			var value = data[key];
			if (value instanceof JointData) {
				if (pose && value._jointIndex >= 0) {
					value.applyTo(pose._localTransforms[value._jointIndex]);
				}
			} else if (value instanceof TransformData) {
				if (transformComponent) {
					value.applyTo(transformComponent.transform);
					transformComponent.updateTransform();
					this._updateWorldTransform(transformComponent);
				}
			} else if (value instanceof TriggerData) {
				if (value.armed) {
					// pull callback(s) for the current trigger key, if exists, and call.
					// TODO: Integrate with GameMaker somehow
					for (var i = 0, maxI = value._currentTriggers.length; i < maxI; i++) {
						var callbacks = this._triggerCallbacks[value._currentTriggers[i]];
						if (callbacks && callbacks.length) {
							for (var j = 0, maxJ = callbacks.length; j < maxJ; j++) {
								callbacks[j]();
							}
						}
					}
					value.armed = false;
				}
			} else if (value instanceof Array) {
				this.floats[key] = value[0];
			}
		}
		if (pose) {
			pose.updateTransforms();
		}
	};

	AnimationComponent.prototype._updateWorldTransform = function (transformComponent) {
		transformComponent.updateWorldTransform();

		for (var i = 0; i < transformComponent.children.length; i++) {
			this._updateWorldTransform(transformComponent.children[i]);
		}
	};

	/*
	 * Called after the animations are applied
	 */
	AnimationComponent.prototype.postUpdate = function () {
		// post update to clear states
		for (var i = 0, max = this.layers.length; i < max; i++) {
			this.layers[i].postUpdate();
		}
	};

	/*
	 * Gets the current animation data for all layers blended together
	 */
	AnimationComponent.prototype.getCurrentSourceData = function () {
		// set up our layer blending.
		if (this.layers.length === 0) {
			return [];
		}
		var last = this.layers.length - 1;
		this.layers[0]._layerBlender = null;
		for (var i = 0; i < last; i++) {
			this.layers[i + 1].updateLayerBlending(this.layers[i]);
		}
		return this.layers[last].getCurrentSourceData();
	};

	/**
	 * Add a new {@link AnimationLayer} to the stack
	 * @param {AnimationLayer} layer
	 * @param {number} [index] if no index is supplied, it's put on top of the stack
	 */
	AnimationComponent.prototype.addLayer = function (layer, index) {
		if (!isNaN(index)) {
			this.layers.splice(index, 0, layer);
		} else {
			this.layers.push(layer);
		}
	};

	AnimationComponent.prototype.resetClips = function (globalTime) {
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].resetClips(globalTime);
		}
	};

	AnimationComponent.prototype.shiftClipTime = function (shiftTime) {
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].shiftClipTime(shiftTime);
		}
	};

	AnimationComponent.prototype.setTimeScale = function (timeScale) {
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].setTimeScale(timeScale);
		}
	};

	AnimationComponent.prototype.pause = function () {
		if (!this.paused) {
			this.lastTimeOfPause = World.time;
			this.paused = true;
		}
	};

	AnimationComponent.prototype.stop = function () {
		if (this._skeletonPose) {
			this._skeletonPose.setToBindPose();
		}
		this.paused = true;
		this.lastTimeOfPause = -1;
	};

	AnimationComponent.prototype.resume = function () {
		if (this.paused || this.lastTimeOfPause === -1) {
			if (this.lastTimeOfPause === -1) {
				this.resetClips(World.time);
			} else {
				this.shiftClipTime(World.time - this.lastTimeOfPause);
			}
		}
		this.paused = false;
	};

	AnimationComponent.prototype.clone = function () {
		var cloned = new AnimationComponent();

		cloned.layers = this.layers.map(function (layer) {
			return layer.clone();
		});
		return cloned;
	};

	return AnimationComponent;
})(goo.Component,goo.World,goo.AnimationLayer,goo.JointData,goo.TransformData,goo.TriggerData);
goo.AnimationClipHandler = (function (
	ConfigHandler,
	AnimationClip,
	JointChannel,
	TransformChannel,
	InterpolatedFloatChannel,
	TriggerChannel,
	ArrayUtils
) {
	'use strict';

	/**
	 * Handler for loading animation clips into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function AnimationClipHandler() {
		ConfigHandler.apply(this, arguments);
	}

	AnimationClipHandler.prototype = Object.create(ConfigHandler.prototype);
	AnimationClipHandler.prototype.constructor = AnimationClipHandler;
	ConfigHandler._registerClass('clip', AnimationClipHandler);

	/**
	 * Creates an empty animation clip
	 * @param {string} ref
	 * @returns {AnimationClip}
	 * @private
	 */
	AnimationClipHandler.prototype._create = function () {
		return new AnimationClip();
	};

	/**
	 * Adds/updates/removes an animation clip
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} Resolves with the updated animation clip or null if removed
	 */
	AnimationClipHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (clip) {
			if (!clip) { return clip; }
			return that.loadObject(config.binaryRef, options).then(function (bindata) {
				if (!bindata) {
					throw new Error('Binary clip data was empty');
				}
				return that._updateAnimationClip(config, bindata, clip);
			});
		});
	};

	/**
	 * Does the actual updating of animation clip and channels
	 * It creates new channels on every update, but clips are practically never updated
	 * @param {Object} clipConfig
	 * @param {ArrayBuffer} binData
	 * @param {AnimationClip} clip
	 * @private
	 */
	AnimationClipHandler.prototype._updateAnimationClip = function (clipConfig, bindata, clip) {
		clip._channels = [];

		if (clipConfig.channels) {
			var keys = Object.keys(clipConfig.channels);
			for (var i = 0; i < keys.length; i++) {
				var channelConfig = clipConfig.channels[keys[i]];
				// Time samples
				var times = ArrayUtils.getTypedArray(bindata, channelConfig.times);

				var blendType = channelConfig.blendType;
				var type = channelConfig.type;

				var channel;
				switch (type) {
					case 'Joint':
					case 'Transform':
						// Transform samples
						var rots, trans, scales;
						rots = ArrayUtils.getTypedArray(bindata, channelConfig.rotationSamples);
						trans = ArrayUtils.getTypedArray(bindata, channelConfig.translationSamples);
						scales = ArrayUtils.getTypedArray(bindata, channelConfig.scaleSamples);

						if (type === 'Joint') {
							channel = new JointChannel(
								channelConfig.jointIndex,
								channelConfig.name,
								times,
								rots,
								trans,
								scales,
								blendType
							);
						} else {
							channel = new TransformChannel(
								channelConfig.name,
								times,
								rots,
								trans,
								scales,
								blendType
							);
						}
						break;
					case 'FloatLERP':
						channel = new InterpolatedFloatChannel(
							channelConfig.name,
							times,
							channelConfig.values,
							blendType
						);
						break;
					case 'Trigger':
						channel = new TriggerChannel(
							channelConfig.name,
							times,
							channelConfig.keys
						);
						channel.guarantee = !!channelConfig.guarantee;
						break;
					default:
						console.warn('Unhandled channel type: ' + channelConfig.type);
						continue;
				}
				clip.addChannel(channel);
			}
		}
		return clip;
	};

	return AnimationClipHandler;
})(goo.ConfigHandler,goo.AnimationClip,goo.JointChannel,goo.TransformChannel,goo.InterpolatedFloatChannel,goo.TriggerChannel,goo.ArrayUtils);
goo.AnimationComponentHandler = (function (
	ComponentHandler,
	AnimationComponent,
	RSVP
) {
	'use strict';

	/**
	 * For handling loading of animation components
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {Function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function AnimationComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'AnimationComponent';
	}

	AnimationComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	AnimationComponentHandler.prototype.constructor = AnimationComponentHandler;
	ComponentHandler._registerClass('animation', AnimationComponentHandler);

	/**
	 * Create animation component.
	 * @returns {AnimationComponent} the created component object
	 * @private
	 */
	AnimationComponentHandler.prototype._create = function () {
		return new AnimationComponent();
	};

	/**
	 * Update engine animation component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	AnimationComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;

		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			var promises = [];
			var p;

			var poseRef = config.poseRef;
			if (poseRef) {
				p = that._load(poseRef, options).then(function (pose) {
					component._skeletonPose = pose;
				});
				promises.push(p);
			}

			var layersRef = config.layersRef;
			if (layersRef) {
				p = that._load(layersRef, options).then(function (layers) {
					component.layers = layers;
					component._layersId = layersRef;
				});
				promises.push(p);
			}
			return RSVP.all(promises).then(function () {
				return component;
			});
		});
	};

	return AnimationComponentHandler;
})(goo.ComponentHandler,goo.AnimationComponent,goo.rsvp);
goo.AnimationLayersHandler = (function (
	ConfigHandler,
	AnimationLayer,
	FadeTransitionState,
	SyncFadeTransitionState,
	FrozenTransitionState,
	RSVP,
	_
) {
	'use strict';

	/**
	 * Handler for loading animation layers
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @extends ConfigHandler
	 * @private
	 */
	function AnimationLayersHandler() {
		ConfigHandler.apply(this, arguments);
	}

	AnimationLayersHandler.prototype = Object.create(ConfigHandler.prototype);
	AnimationLayersHandler.prototype.constructor = AnimationLayersHandler;
	ConfigHandler._registerClass('animation', AnimationLayersHandler);

	/**
	 * Creates an empty array to store animation layers
	 * @param {string} ref
	 * @returns {Array<AnimationLayer>}
	 * @private
	 */
	AnimationLayersHandler.prototype._create = function (ref) {
		var layer = [];
		this._objects.set(ref, layer);
		return layer;
	};

	/**
	 * Sets current state on a layer if possible, otherwise clears  current state
	 * @param {AnimationLayer} layer
	 * @param {string} name
	 */
	AnimationLayersHandler.prototype._setInitialState = function (layer, stateKey) {
		if (stateKey) {
			var state = layer.getStateById(stateKey);
			if (layer._currentState !== state) {
				layer.setCurrentStateById(stateKey, true);
			}
		} else {
			layer.setCurrentState();
		}
	};

	/**
	 * Adds/updates/removes the animation layers
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} Resolves with the updated animation state or null if removed
	 */
	AnimationLayersHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (object) {
			if (!object) { return; }
			var promises = [];

			var i = 0;
			_.forEach(config.layers, function (layerCfg) {
				promises.push(that._parseLayer(layerCfg, object[i++], options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function (layers) {
				object.length = layers.length;
				for (var i = 0; i < layers.length; i++) {
					object[i] = layers[i];
				}
				return object;
			});
		});
	};

	/**
	 * Parses a single layer, puts the correct properties and {@link SteadyState} onto it
	 * @param {Object} layerConfig
	 * @param {layer}
	 * @returns {RSVP.Promise} resolves with layer
	 * @private
	 */
	AnimationLayersHandler.prototype._parseLayer = function (layerConfig, layer, options) {
		var that = this;

		if (!layer) {
			layer = new AnimationLayer(layerConfig.name);
		} else {
			layer._name = layerConfig.name;
		}

		layer.id = layerConfig.id;
		layer._transitions = _.deepClone(layerConfig.transitions);

		if (layer._layerBlender) {
			if (layerConfig.blendWeight !== undefined) {
				layer._layerBlender._blendWeight = layerConfig.blendWeight;
			} else {
				layer._layerBlender._blendWeight = 1.0;
			}
		}

		// Load all the stuff we need
		var promises = [];
		_.forEach(layerConfig.states, function (stateCfg) {
			promises.push(that.loadObject(stateCfg.stateRef, options).then(function (state) {
				layer.setState(state.id, state);
			}));
		}, null, 'sortValue');

		// Populate layer
		return RSVP.all(promises).then(function () {
			that._setInitialState(layer, layerConfig.initialStateRef);
			return layer;
		});
	};

	return AnimationLayersHandler;
})(goo.ConfigHandler,goo.AnimationLayer,goo.FadeTransitionState,goo.SyncFadeTransitionState,goo.FrozenTransitionState,goo.rsvp,goo.ObjectUtils);
goo.AnimationStateHandler = (function (
	ConfigHandler,
	SteadyState,
	ClipSource,
	ManagedTransformSource,
	BinaryLerpSource,
	FrozenClipSource,
	RSVP,
	PromiseUtils,
	_
) {
	'use strict';

	/**
	 * Handler for loading animation states into engine
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @extends ConfigHandler
	 * @private
	 */
	function AnimationStateHandler() {
		ConfigHandler.apply(this, arguments);
	}
	AnimationStateHandler.prototype = Object.create(ConfigHandler.prototype);
	AnimationStateHandler.prototype.constructor = AnimationStateHandler;
	ConfigHandler._registerClass('animstate', AnimationStateHandler);

	/**
	 * Creates an empty animation state
	 * @param {string} ref
	 * @returns {SteadyState}
	 * @private
	 */
	AnimationStateHandler.prototype._create = function (ref) {
		var steadyState = new SteadyState();
		this._objects.set(ref, steadyState);
		return steadyState;
	};

	/**
	 * Adds/updates/removes an animation state
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} Resolves with the updated animation state or null if removed
	 */
	AnimationStateHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (state) {
			if (!state) { return; }
			state._name = config.name;
			state.id = config.id;
			state._transitions = _.deepClone(config.transitions);

			return that._parseClipSource(config.clipSource, state._sourceTree, options).then(function (source) {
				state._sourceTree = source;
				return state;
			});
		});
	};

	/**
	 * Updates or creates clipSource to put on animation state
	 * @param {Object} config
	 * @param {ClipSource} [clipSource]
	 * @returns {RSVP.Promise} resolved with updated clip source
	 */
	AnimationStateHandler.prototype._parseClipSource = function (cfg, clipSource, options) {
		switch (cfg.type) {
			case 'Clip':
				return this.loadObject(cfg.clipRef, options).then(function (clip) {
					if (clipSource && (clipSource instanceof ClipSource)) {
						clipSource._clip = clip;
						clipSource.setFilter(cfg.filter, cfg.channels);
					} else {
						clipSource = new ClipSource(clip, cfg.filter, cfg.channels);
					}

					if (cfg.loopCount !== undefined) {
						clipSource._clipInstance._loopCount = +cfg.loopCount;
					}

					if (cfg.timeScale !== undefined) {
						clipSource._clipInstance._timeScale = cfg.timeScale;
					}

					clipSource._startTime = cfg.startTime || 0;
					var minTime = Infinity;
					for (var i = 0; i < clip._channels.length; i++) {
						var channel = clip._channels[i];
						for (var j = 0; j < channel._times.length; j++) {
							var time = channel._times[j];
							if (time < minTime) { minTime = time; }
						}
					}
					clipSource._startTime = Math.max(clipSource._startTime, minTime);

					return clipSource;
				});
			case 'Managed':
				if (!clipSource || !(clipSource instanceof ManagedTransformSource)) {
					clipSource = new ManagedTransformSource();
				}
				if (cfg.clipRef) {
					return this.loadObject(cfg.clipRef, options).then(function (clip) {
						clipSource.initFromClip(clip, cfg.filter, cfg.channels);
						return clipSource;
					});
				} else {
					return PromiseUtils.resolve(clipSource);
				}
				break;
			case 'Lerp':
				// TODO reuse object like the other parsers
				var promises = [
					this._parseClipSource(cfg.clipSourceA, null, options),
					this._parseClipSource(cfg.clipSourceB, null, options)
				];
				return RSVP.all(promises).then(function (clipSources) {
					clipSource = new BinaryLerpSource(clipSources[0], clipSources[1]);
					if (cfg.blendWeight) {
						clipSource.blendWeight = cfg.blendWeight;
					}
					return clipSource;
				});
			case 'Frozen':
				return this._parseClipSource(cfg.clipSource).then(function (subClipSource) {
					if (!clipSource || !(clipSource instanceof FrozenClipSource)) {
						clipSource = new FrozenClipSource(subClipSource, cfg.frozenTime || 0.0);
					} else {
						clipSource._source = subClipSource;
						clipSource._time = cfg.frozenTime || 0.0;
					}
					return clipSource;
				});
			default:
				console.error('Unable to parse clip source');
				return PromiseUtils.resolve();
		}
	};

	return AnimationStateHandler;
})(goo.ConfigHandler,goo.SteadyState,goo.ClipSource,goo.ManagedTransformSource,goo.BinaryLerpSource,goo.FrozenClipSource,goo.rsvp,goo.PromiseUtils,goo.ObjectUtils);
goo.SkeletonHandler = (function (
	ConfigHandler,
	Joint,
	Skeleton,
	SkeletonPose,
	PromiseUtils,
	_
) {
	'use strict';

	/**
	 * Handler for loading skeletons into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function SkeletonHandler() {
		ConfigHandler.apply(this, arguments);
	}

	SkeletonHandler.prototype = Object.create(ConfigHandler.prototype);
	SkeletonHandler.prototype.constructor = SkeletonHandler;
	ConfigHandler._registerClass('skeleton', SkeletonHandler);

	/**
	 * Adds/updates/removes a skeleton. A Skeleton is created once and then reused, but skeletons
	 * are rarely updated.
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} Resolves with the updated entity or null if removed
	 */
	SkeletonHandler.prototype._update = function (ref, config/*, options*/) {
		if (!this._objects.has(ref)) {
			if (!config) {
				return PromiseUtils.resolve();
			}
			var joints = [];
			_.forEach(config.joints, function (jointConfig) {
				var joint = new Joint(jointConfig.name);
				joint._index = jointConfig.index;
				joint._parentIndex = jointConfig.parentIndex;
				joint._inverseBindPose.matrix.data.set(jointConfig.inverseBindPose);

				joints.push(joint);
			}, null, 'index');

			var skeleton = new Skeleton(config.name, joints);
			var pose = new SkeletonPose(skeleton);
			pose.setToBindPose();
			this._objects.set(ref, pose);
		}

		return PromiseUtils.resolve(this._objects.get(ref));
	};

	return SkeletonHandler;
})(goo.ConfigHandler,goo.Joint,goo.Skeleton,goo.SkeletonPose,goo.PromiseUtils,goo.ObjectUtils);
goo.AnimationHandlers = (function () {})(goo.AnimationClipHandler,goo.AnimationComponentHandler,goo.AnimationLayersHandler,goo.AnimationStateHandler,goo.SkeletonHandler);
goo.AnimationSystem = (function (
	System,
	World
) {
	'use strict';

	/**
	 * Processes all entities with animation components, updating the animations
	 * @extends System
	 */
	function AnimationSystem() {
		System.call(this, 'AnimationSystem', ['AnimationComponent']);
	}

	AnimationSystem.prototype = Object.create(System.prototype);

	AnimationSystem.prototype.process = function () {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			var animationComponent = entity.animationComponent;
			animationComponent.update(World.time);
			animationComponent.apply(entity.transformComponent);
			animationComponent.postUpdate();
		}
	};

	AnimationSystem.prototype.pause = function () {
		this.passive = true;
		for (var i = 0; i < this._activeEntities.length; i++) {
			this._activeEntities[i].animationComponent.pause();
		}
	};

	AnimationSystem.prototype.resume = function () {
		this.passive = false;
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			entity.animationComponent.resume();
		}
	};

	AnimationSystem.prototype.play = AnimationSystem.prototype.resume;

	AnimationSystem.prototype.stop = function () {
		this.passive = true;
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			entity.animationComponent.stop();
		}
	};

	return AnimationSystem;
})(goo.System,goo.World);
if (typeof require === "function") {
define("goo/animationpack/Joint", [], function () { return goo.Joint; });
define("goo/animationpack/Skeleton", [], function () { return goo.Skeleton; });
define("goo/animationpack/SkeletonPose", [], function () { return goo.SkeletonPose; });
define("goo/animationpack/clip/TransformData", [], function () { return goo.TransformData; });
define("goo/animationpack/blendtree/BinaryLerpSource", [], function () { return goo.BinaryLerpSource; });
define("goo/animationpack/blendtree/FrozenClipSource", [], function () { return goo.FrozenClipSource; });
define("goo/animationpack/clip/AnimationClipInstance", [], function () { return goo.AnimationClipInstance; });
define("goo/animationpack/blendtree/ClipSource", [], function () { return goo.ClipSource; });
define("goo/animationpack/clip/AbstractAnimationChannel", [], function () { return goo.AbstractAnimationChannel; });
define("goo/animationpack/clip/TransformChannel", [], function () { return goo.TransformChannel; });
define("goo/animationpack/clip/JointData", [], function () { return goo.JointData; });
define("goo/animationpack/clip/JointChannel", [], function () { return goo.JointChannel; });
define("goo/animationpack/blendtree/ManagedTransformSource", [], function () { return goo.ManagedTransformSource; });
define("goo/animationpack/clip/AnimationClip", [], function () { return goo.AnimationClip; });
define("goo/animationpack/clip/InterpolatedFloatChannel", [], function () { return goo.InterpolatedFloatChannel; });
define("goo/animationpack/clip/TriggerData", [], function () { return goo.TriggerData; });
define("goo/animationpack/clip/TriggerChannel", [], function () { return goo.TriggerChannel; });
define("goo/animationpack/state/AbstractState", [], function () { return goo.AbstractState; });
define("goo/animationpack/state/AbstractTransitionState", [], function () { return goo.AbstractTransitionState; });
define("goo/animationpack/state/FadeTransitionState", [], function () { return goo.FadeTransitionState; });
define("goo/animationpack/state/SyncFadeTransitionState", [], function () { return goo.SyncFadeTransitionState; });
define("goo/animationpack/state/FrozenTransitionState", [], function () { return goo.FrozenTransitionState; });
define("goo/animationpack/state/SteadyState", [], function () { return goo.SteadyState; });
define("goo/animationpack/layer/LayerLerpBlender", [], function () { return goo.LayerLerpBlender; });
define("goo/animationpack/layer/AnimationLayer", [], function () { return goo.AnimationLayer; });
define("goo/animationpack/components/AnimationComponent", [], function () { return goo.AnimationComponent; });
define("goo/animationpack/handlers/AnimationClipHandler", [], function () { return goo.AnimationClipHandler; });
define("goo/animationpack/handlers/AnimationComponentHandler", [], function () { return goo.AnimationComponentHandler; });
define("goo/animationpack/handlers/AnimationLayersHandler", [], function () { return goo.AnimationLayersHandler; });
define("goo/animationpack/handlers/AnimationStateHandler", [], function () { return goo.AnimationStateHandler; });
define("goo/animationpack/handlers/SkeletonHandler", [], function () { return goo.SkeletonHandler; });
define("goo/animationpack/handlers/AnimationHandlers", [], function () { return goo.AnimationHandlers; });
define("goo/animationpack/systems/AnimationSystem", [], function () { return goo.AnimationSystem; });
}

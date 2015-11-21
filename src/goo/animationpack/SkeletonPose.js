var Transform = require('goo/math/Transform');
var Joint = require('goo/animationpack/Joint');
var Matrix4 = require('goo/math/Matrix4');

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

	module.exports = SkeletonPose;
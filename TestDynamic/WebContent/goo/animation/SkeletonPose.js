define(['goo/math/Transform', 'goo/animation/Joint', 'goo/math/Matrix4x4'], function(Transform, Joint, Matrix4x4) {
	"use strict";

	/**
	 * @name SkeletonPose
	 * @class Joins a Skeleton with an array of joint poses. This allows the _skeleton to exist and be reused between multiple instances of poses.
	 * @param {Skeleton} _skeleton the _skeleton to use.
	 * @property {Skeleton} _skeleton the _skeleton to use.
	 */
	function SkeletonPose(_skeleton) {
		this._skeleton = _skeleton;

		this._localTransforms = [];
		this._globalTransforms = [];
		this._matrixPalette = [];
		this._poseListeners = [];

		var jointCount = this._skeleton.joints.length;

		// init local transforms
		for ( var i = 0; i < jointCount; i++) {
			this._localTransforms[i] = new Transform();
		}

		// init global transforms
		for ( var i = 0; i < jointCount; i++) {
			this._globalTransforms[i] = new Transform();
		}

		// init palette
		for ( var i = 0; i < jointCount; i++) {
			this._matrixPalette[i] = new Matrix4x4();
		}

		// start off in bind pose.
		this.setToBindPose();
	}

	/**
	 * Update our local joint transforms so that they reflect the _skeleton in bind pose.
	 */
	SkeletonPose.prototype.setToBindPose = function() {
		var temp = new Transform();
		// go through our local transforms
		for ( var i = 0; i < this._localTransforms.length; i++) {
			// Set us to the bind pose
			this._localTransforms[i].copy(this._skeleton.joints[i].inverseBindPose);
			// then invert.
			this._localTransforms[i].invert(this._localTransforms[i]);

			// At this point we are in model space, so we need to remove our parent's transform (if we have one.)
			var parentIndex = this._skeleton.joints[i].parentIndex;
			if (parentIndex !== Joint.NO_PARENT) {
				// We remove the parent's transform simply by multiplying by its inverse bind pose. Done! :)

				temp.multiply(this._skeleton.joints[parentIndex].inverseBindPose, this._localTransforms[i]);
				// this._skeleton.joints[parentIndex].inverseBindPose.multiply(this._localTransforms[i], temp);
				this._localTransforms[i].copy(temp);
			}
		}
		this.updateTransforms();
		this.firePoseUpdated();
	};

	/**
	 * Update the global and palette transforms of our posed joints based on the current local joint transforms.
	 */
	SkeletonPose.prototype.updateTransforms = function() {
		var temp = new Transform();
		// we go in update array order, which ensures parent global transforms are updated before child.
		// final int[] orders = _skeleton.getJointOrders();
		var nrJoints = this._skeleton.joints.length;
		// for (var i = 0; i < orders.length; i++) {
		for ( var i = 0; i < nrJoints; i++) {
			// the joint index
			var index = i;

			// find our parent
			var parentIndex = this._skeleton.joints[index].parentIndex;
			if (parentIndex !== Joint.NO_PARENT) {
				// we have a parent, so take us from local->parent->model space by multiplying by parent's local->model
				// space transform.
				// this._globalTransforms[parentIndex].multiply(this._localTransforms[index], this._globalTransforms[index]);
				this._globalTransforms[index].multiply(this._globalTransforms[parentIndex], this._localTransforms[index]);
			} else {
				// no parent so just set global to the local transform
				this._globalTransforms[index].copy(this._localTransforms[index]);
			}

			// at this point we have a local->model space transform for this joint, for skinning we multiply this by the
			// joint's inverse bind pose (joint->model space, inverted). This gives us a transform that can take a
			// vertex from bind pose (model space) to current pose (model space).
			temp.multiply(this._globalTransforms[index], this._skeleton.joints[index].inverseBindPose);
			this._matrixPalette[index].copy(temp.matrix);
			// this._globalTransforms[index].multiply(this._skeleton.joints[index].inverseBindPose, temp);
			// temp.getHomogeneousMatrix(this._matrixPalette[index]);
		}
		this.firePoseUpdated();
	};

	/**
	 * Notify any registered PoseListeners that this pose has been "updated".
	 */
	SkeletonPose.prototype.firePoseUpdated = function() {
		for ( var i = this._poseListeners.length; --i >= 0;) {
			this._poseListeners[i].poseUpdated(this);
		}
	};

	return SkeletonPose;
});
define(['goo/math/Transform', 'goo/animation/Joint', 'goo/math/Matrix4x4'], function(Transform, Joint, Matrix4x4) {
	"use strict";

	/**
	 * @name SkeletonPose
	 * @class The purpose of this class is to hold additional information regarding a typedarray buffer, like vbo 'usage' flags
	 * @param {ArrayBuffer} data Data to wrap
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function SkeletonPose(skeleton) {
		this.skeleton = skeleton;

		this.localTransforms = [];
		this.globalTransforms = [];
		this.matrixPalette = [];
		this.poseListeners = [];

		var jointCount = this.skeleton.joints.length;

		// init local transforms
		for ( var i = 0; i < jointCount; i++) {
			this.localTransforms[i] = new Transform();
		}

		// init global transforms
		for ( var i = 0; i < jointCount; i++) {
			this.globalTransforms[i] = new Transform();
		}

		// init palette
		for ( var i = 0; i < jointCount; i++) {
			this.matrixPalette[i] = new Matrix4x4();
		}

		// start off in bind pose.
		this.setToBindPose();
	}

	SkeletonPose.prototype.setToBindPose = function() {
		var temp = new Transform();
		// go through our local transforms
		for ( var i = 0; i < this.localTransforms.length; i++) {
			// Set us to the bind pose
			this.localTransforms[i].copy(this.skeleton.joints[i].inverseBindPose);
			// then invert.
			this.localTransforms[i].invert(this.localTransforms[i]);

			// At this point we are in model space, so we need to remove our parent's transform (if we have one.)
			var parentIndex = this.skeleton.joints[i].parentIndex;
			if (parentIndex != Joint.NO_PARENT) {
				// We remove the parent's transform simply by multiplying by its inverse bind pose. Done! :)
				this.skeleton.joints[parentIndex].inverseBindPose.multiply(this.localTransforms[i], temp);
				this.localTransforms[i].copy(temp);
			}
		}
		this.updateTransforms();
		this.firePoseUpdated();
	};

	SkeletonPose.prototype.updateTransforms = function() {
		var temp = new Transform();
		// we go in update array order, which ensures parent global transforms are updated before child.
		// final int[] orders = _skeleton.getJointOrders();
		var nrJoints = this.skeleton.joints.length;
		// for (var i = 0; i < orders.length; i++) {
		for ( var i = 0; i < nrJoints; i++) {
			// the joint index
			var index = i;

			// find our parent
			var parentIndex = this.skeleton.joints[index].parentIndex;
			if (parentIndex != Joint.NO_PARENT) {
				// we have a parent, so take us from local->parent->model space by multiplying by parent's local->model
				// space transform.
				this.globalTransforms[parentIndex].multiply(this.localTransforms[index], this.globalTransforms[index]);
			} else {
				// no parent so just set global to the local transform
				this.globalTransforms[index].set(this.localTransforms[index]);
			}

			// at this point we have a local->model space transform for this joint, for skinning we multiply this by the
			// joint's inverse bind pose (joint->model space, inverted). This gives us a transform that can take a
			// vertex from bind pose (model space) to current pose (model space).
			this.globalTransforms[index].multiply(this.skeleton.joints[index].inverseBindPose, temp);
			temp.getHomogeneousMatrix(this.matrixPalette[index]);
		}
		firePoseUpdated();
	};

	return SkeletonPose;
});
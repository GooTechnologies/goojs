define([
	'goo/math/Transform',
	'goo/math/Matrix4x4'
	],
/** @lends */
function (
	Transform,
	Matrix4x4
	) {
	"use strict";

	/**
	 * @class Representation of a Joint in a Skeleton. Meant to be used within a specific Skeleton object.
	 * @param {String} name Name of joint
	 */
	function Joint (name) {
		this._name = name;

		this._index = 0;
		this._parentIndex = 0;
		this._inverseBindPose = new Transform();
		this.localTransform = null;
	}

	Joint.NO_PARENT = -32768;

	Joint._tmpMatrix1 = new Matrix4x4();
	Joint._tmpMatrix2 = new Matrix4x4();

	Joint.prototype.computeLocalTransform = function(parentTransform) {
		if (parentTransform) {
			Matrix4x4.invert(this._inverseBindPose.matrix, Joint._tmpMatrix1);
			Matrix4x4.combine(
				parentTransform.matrix,
				Joint._tmpMatrix1,
				Joint._tmpMatrix2
			);

			this.localTransform = Transform.fromMatrix(Joint._tmpMatrix2);
			console.log('parent', this.localTransform);
		} else {
			Matrix4x4.invert(this._inverseBindPose.matrix, this._tmpMatrix1);

			this.localTransform = Transform.fromMatrix(Joint._tmpMatrix1);
			console.log('orfan', this.localTransform);
		}
	};

	return Joint;
});
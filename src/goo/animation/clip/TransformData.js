define([
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Matrix3x3'
	],
/** @lends */
function (
	Quaternion,
	Vector3,
	Matrix3x3
	) {
	"use strict";

	/**
	 * @class Describes a relative transform as a Quaternion-Vector-Vector tuple. We use QVV to make it simpler to do LERP blending.
	 * @param {TransformData} [source] source to copy.
	 */
	function TransformData (source) {
		this._translationX = null;
		this._translationY = null;
		this._translationZ = null;

		this._rotationX = null;
		this._rotationY = null;
		this._rotationZ = null;
		this._rotationW = null;

		this._scaleX = 1;
		this._scaleY = 1;
		this._scaleZ = 1;


		this._rotation = new Quaternion().copy(source ? source._rotation : Quaternion.IDENTITY);
		this._scale = new Vector3().copy(source ? source._scale : Vector3.ONE);
		this._translation = new Vector3().copy(source ? source._translation : Vector3.ZERO);

	}

	/**
	 * Applies the data from this transformdata to supplied transform
	 * @param {Transform}
	 */
	var tmpQuat = new Quaternion();

	TransformData.prototype.applyTo = function (transform) {
		//transform.setIdentity();

		if (this._translationX !== null) transform.translation.data[0] = this._translationX;
		if (this._translationY !== null) transform.translation.data[1] = this._translationY;
		if (this._translationZ !== null) transform.translation.data[2] = this._translationZ;

		if (this._rotationX !== null || this._rotationY !== null || this._rotationZ !== null || this._rotationW !== null) {
			var z = Math.random();
			if (z < 0.0001) console.log(transform.rotation.data);
			tmpQuat.setd(0, 0, 0, 1);
			var quat = tmpQuat.fromRotationMatrix(transform.rotation);

			if (this._rotationX !== null) quat.data[0] = this._rotationX;
			if (this._rotationY !== null) quat.data[1] = this._rotationY;
			if (this._rotationZ !== null) quat.data[2] = this._rotationZ;
			if (this._rotationW !== null) quat.data[3] = this._rotationW;

			transform.rotation.copyQuaternion(quat);
			if (z < 0.0001) console.log(transform.rotation.data);
		}

		if (this._scaleX !== null) transform.scale.data[0] = this._scaleX;
		if (this._scaleY !== null) transform.scale.data[1] = this._scaleY;
		if (this._scaleZ !== null) transform.scale.data[2] = this._scaleZ;

		// TODO: matrix vs quaternion?
		//transform.rotation.copyQuaternion(this._rotation);
		//transform.scale.setv(this._scale);
		//transform.translation.setv(this._translation); */
		transform.update();
		//*/
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
	 * @return {TransformData} The blended transform.
	 */
	TransformData.prototype.blend = function (blendTo, blendWeight, store) {
		var tData = store ? store : new TransformData();

		tData._translation.setv(this._translation).lerp(blendTo._translation, blendWeight);
		tData._scale.setv(this._scale).lerp(blendTo._scale, blendWeight);
		Quaternion.slerp(this._rotation, blendTo._rotation, blendWeight, tData._rotation);
		return tData;
	};

	return TransformData;
});
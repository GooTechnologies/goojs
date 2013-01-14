define(['goo/math/Quaternion', 'goo/math/Vector3'],
	/** @lends TransformData */
	function (Quaternion, Vector3) {
	"use strict";

	/**
	 * @class Describes a relative transform as a Quaternion-Vector-Vector tuple. We use QVV to make it simpler to do LERP blending.
	 * @param source our optional TransformData source to copy.
	 */
	function TransformData(source) {
		this._rotation = new Quaternion().copy(source ? source._rotation : Quaternion.IDENTITY);
		this._scale = new Vector3().copy(source ? source._scale : Vector3.ONE);
		this._translation = new Vector3().copy(source ? source._translation : Vector3.ZERO);
	}

	TransformData.prototype.applyTo = function (transform) {
		transform.setIdentity();
		// TODO: matrix vs quaternion?
		transform.rotation.copyQuaternion(this._rotation);
		transform.scale.copy(this._scale);
		transform.translation.copy(this._translation);
		transform.update();
	};

	/**
	 * @description Copy the source's values into this transform data object.
	 * @param source our source to copy.
	 */
	TransformData.prototype.set = function (source) {
		this._rotation.copy(source._rotation);
		this._scale.copy(source._scale);
		this._translation.copy(source._translation);
	};

	/**
	 * @description Blend this TransformData with the given TransformData.
	 * @param blendTo The TransformData to blend to
	 * @param blendWeight The blend weight
	 * @param store The TransformData store.
	 * @return The blended transform.
	 */
	TransformData.prototype.blend = function (blendTo, blendWeight, store) {
		var tData = store ? store : new TransformData();
		var scaleX = 0.0, scaleY = 0.0, scaleZ = 0.0, transX = 0.0, transY = 0.0, transZ = 0.0;
		var vectorData, weight;

		weight = 1 - blendWeight;
		vectorData = this._translation;
		transX += vectorData.x * weight;
		transY += vectorData.y * weight;
		transZ += vectorData.z * weight;

		vectorData = this._scale;
		scaleX += vectorData.x * weight;
		scaleY += vectorData.y * weight;
		scaleZ += vectorData.z * weight;

		weight = blendWeight;
		vectorData = blendTo._translation;
		transX += vectorData.x * weight;
		transY += vectorData.y * weight;
		transZ += vectorData.z * weight;

		vectorData = blendTo._scale;
		scaleX += vectorData.x * weight;
		scaleY += vectorData.y * weight;
		scaleZ += vectorData.z * weight;

		tData._scale.set(scaleX, scaleY, scaleZ);
		tData._translation.set(transX, transY, transZ);
		Quaternion.slerp(this._rotation, blendTo._rotation, weight, tData._rotation);
		return tData;
	};

	return TransformData;
});
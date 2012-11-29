define(['goo/math/Quaternion', 'goo/math/Vector3'], function(Quaternion, Vector3) {
	"use strict";

	/**
	 * @name TransformData
	 * @class Describes a relative transform as a Quaternion-Vector-Vector tuple. We use QVV to make it simpler to do LERP blending.
	 */
	function TransformData(source) {
		this._rotation = new Quaternion().copy(source ? source._rotation : Quaternion.IDENTITY);
		this._scale = new Vector3().copy(source ? source._scale : Vector3.ONE);
		this._translation = new Vector3().copy(source ? source._translation : Vector3.ZERO);
	}

	TransformData.prototype.applyTo = function(transform) {
		transform.setIdentity();
		// TODO: matrix vs quaternion?
		transform.rotation.copyQuaternion(this._rotation);
		transform.scale.copy(this._scale);
		transform.translation.copy(this._translation);
		transform.update();
	};

	return TransformData;
});
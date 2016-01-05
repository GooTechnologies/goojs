define([
	'goo/addons/particlepack/curves/ConstantCurve',
	'goo/addons/particlepack/curves/Curve'
], function (
	LinearCurve,
	Curve
) {
	'use strict';

	/**
	 * @class
	 * @constructor
	 * @param {object} [options]
	 * @param {Curve} [options.x]
	 * @param {Curve} [options.y]
	 * @param {Curve} [options.z]
	 * @param {Curve} [options.w]
	 */
	function Vector4Curve(options) {
		options = options || {};

		options.type = 'vec4';
		Curve.call(this, options);

		// TODO: if these were an array, we could do .map() in the methods
		this.x = options.x ? options.x.clone() : new ConstantCurve();
		this.y = options.y ? options.y.clone() : new ConstantCurve();
		this.z = options.z ? options.z.clone() : new ConstantCurve();
		this.w = options.w ? options.w.clone() : new ConstantCurve({ value: 1 });

		if (this.x.type !== 'float' || this.y.type !== 'float' || this.z.type !== 'float' || this.w.type !== 'float') {
			throw new Error('Vector4Curve must have scalar components.');
		}
	}
	Vector4Curve.prototype = Object.create(Curve.prototype);
	Vector4Curve.prototype.constructor = Vector4Curve;

	Vector4Curve.prototype.toGLSL = function (timeVariableName, lerpValueVariableName) {
		return 'vec4(' + this.x.toGLSL(timeVariableName, lerpValueVariableName) + ',' + this.y.toGLSL(timeVariableName, lerpValueVariableName) + ',' + this.z.toGLSL(timeVariableName, lerpValueVariableName) + ',' + this.w.toGLSL(timeVariableName, lerpValueVariableName) + ')';
	};

	Vector4Curve.prototype.integralToGLSL = function (timeVariableName, lerpValueVariableName) {
		return 'vec4(' + this.x.integralToGLSL(timeVariableName, lerpValueVariableName) + ',' + this.y.integralToGLSL(timeVariableName, lerpValueVariableName) + ',' + this.z.integralToGLSL(timeVariableName, lerpValueVariableName) + ',' + this.w.integralToGLSL(timeVariableName, lerpValueVariableName) + ')';
	};

	Vector4Curve.prototype.getVec4ValueAt = function (t, lerpValue, store) {
		store.setDirect(
			this.x.getValueAt(t, lerpValue),
			this.y.getValueAt(t, lerpValue),
			this.z.getValueAt(t, lerpValue),
			this.w.getValueAt(t, lerpValue)
		);
	};

	Vector4Curve.prototype.getVec4IntegralValueAt = function (t, lerpValue, store) {
		store.setDirect(
			this.x.getIntegralValueAt(t, lerpValue),
			this.y.getIntegralValueAt(t, lerpValue),
			this.z.getIntegralValueAt(t, lerpValue),
			this.w.getIntegralValueAt(t, lerpValue)
		);
	};

	return Vector4Curve;
});
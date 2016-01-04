define([
	'goo/addons/particlepack/curves/LinearCurve',
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

		this.x = options.x !== undefined ? options.x.clone() : new LinearCurve({ k: 0, m: 1 });
		this.y = options.y !== undefined ? options.y.clone() : new LinearCurve({ k: 0, m: 1 });
		this.z = options.z !== undefined ? options.z.clone() : new LinearCurve({ k: 0, m: 1 });
		this.w = options.w !== undefined ? options.w.clone() : new LinearCurve({ k: 0, m: 1 });

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
			this.x.getValueAt(t),
			this.y.getValueAt(t),
			this.z.getValueAt(t),
			this.w.getValueAt(t)
		);
	};

	Vector4Curve.prototype.getVec4IntegralValueAt = function (t, lerpValue, store) {
		store.setDirect(
			this.x.getIntegralValueAt(t),
			this.y.getIntegralValueAt(t),
			this.z.getIntegralValueAt(t),
			this.w.getIntegralValueAt(t)
		);
	};

	return Vector4Curve;
});
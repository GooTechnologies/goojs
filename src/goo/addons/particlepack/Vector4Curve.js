define([
	'goo/addons/particlepack/LinearCurve',
	'goo/addons/particlepack/Curve'
], function (
	LinearCurve,
	Curve
) {
	'use strict';

	function Vector4Curve(options) {
		options = options || {};

		Curve.call(this, options);

		this.x = options.x !== undefined ? options.x : new LinearCurve({ k: 0, m: 1 });
		this.y = options.y !== undefined ? options.y : new LinearCurve({ k: 0, m: 1 });
		this.z = options.z !== undefined ? options.z : new LinearCurve({ k: 0, m: 1 });
		this.w = options.w !== undefined ? options.w : new LinearCurve({ k: 0, m: 1 });
	}
	Vector4Curve.prototype = Object.create(Curve.prototype);
	Vector4Curve.prototype.constructor = Vector4Curve;

	Vector4Curve.prototype.toGLSL = function (timeVariableName) {
		return 'vec4(' + this.x.toGLSL(timeVariableName) + ',' + this.y.toGLSL(timeVariableName) + ',' + this.z.toGLSL(timeVariableName) + ',' + this.w.toGLSL(timeVariableName) + ')';
	};

	Vector4Curve.prototype.integralToGLSL = function (timeVariableName) {
		return 'vec4(' + this.x.integralToGLSL(timeVariableName) + ',' + this.y.integralToGLSL(timeVariableName) + ',' + this.z.integralToGLSL(timeVariableName) + ',' + this.w.integralToGLSL(timeVariableName) + ')';
	};

	Vector4Curve.prototype.getValueAt = function (t, store) {
		return store.setDirect(
			this.x.getValueAt(t),
			this.y.getValueAt(t),
			this.z.getValueAt(t),
			this.w.getValueAt(t)
		);
	};

	Vector4Curve.prototype.getIntegralValueAt = function (t, store) {
		return store.setDirect(
			this.x.getIntegralValueAt(t),
			this.y.getIntegralValueAt(t),
			this.z.getIntegralValueAt(t),
			this.w.getIntegralValueAt(t)
		);
	};

	return Vector4Curve;
});
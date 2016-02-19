define([
	'goo/addons/particlepack/curves/Curve'
], function (
	Curve
) {
	'use strict';

	/**
	 * A curve with a constant value.
	 * @class
	 * @constructor
	 * @extends Curve
	 * @param {object} [options]
	 * @param {number} [options.value=1]
	 */
	function ConstantCurve(options) {
		options = options || {};

		Curve.call(this, options);

		/**
		 * @type {number}
		 */
		this.value = options.value !== undefined ? options.value : 1;
	}
	ConstantCurve.prototype = Object.create(Curve.prototype);
	ConstantCurve.prototype.constructor = ConstantCurve;

	ConstantCurve.prototype.toGLSL = function (/*timeVariableName, lerpValueVariableName*/) {
		return Curve.numberToGLSL(this.value);
	};

	ConstantCurve.prototype.integralToGLSL = function (timeVariableName/*, lerpValueVariableName*/) {
		var value = Curve.numberToGLSL(this.value);
		return '(' + value + '*' + timeVariableName + ')';
	};

	ConstantCurve.prototype.getValueAt = function (/*t, lerpFactor*/) {
		return this.value;
	};

	ConstantCurve.prototype.getIntegralValueAt = function (t /*, lerpFactor*/) {
		return this.value * t;
	};

	return ConstantCurve;
});
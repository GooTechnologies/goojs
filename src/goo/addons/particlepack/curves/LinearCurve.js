define([
	'goo/addons/particlepack/curves/Curve'
], function (
	Curve
) {
	'use strict';

	/**
	 * @class
	 * @constructor
	 * @extends Curve
	 * @param {object} [options]
	 * @param {number} [options.k]
	 * @param {number} [options.m]
	 */
	function LinearCurve(options) {
		options = options || {};

		Curve.call(this, options);

		/**
		 * Slope of the line.
		 * @type {number}
		 */
		this.k = options.k !== undefined ? options.k : 1;

		/**
		 * Value of the line when time is 0.
		 * @type {number}
		 */
		this.m = options.m || 0;
	}
	LinearCurve.prototype = Object.create(Curve.prototype);
	LinearCurve.prototype.constructor = LinearCurve;

	/**
	 * Create the linar curve from a start and end value.
	 * @param {number} startValue
	 * @param {number} endValue
	 */
	LinearCurve.prototype.fromStartEnd = function (startValue, endValue) {
		this.m = startValue;
		this.k = endValue - startValue;
	};

	LinearCurve.prototype.toGLSL = function (timeVariableName/*, lerpValueVariableName*/) {
		return '(' + Curve.numberToGLSL(this.k) + '*' + timeVariableName + '+' + Curve.numberToGLSL(this.m) + ')';
	};

	LinearCurve.prototype.integralToGLSL = function (timeVariableName/*, lerpValueVariableName*/) {
		var k = Curve.numberToGLSL(this.k);
		var m = Curve.numberToGLSL(this.m);
		return '(' + k + '*' + timeVariableName + '*' + timeVariableName + '*0.5+' + m + '*' + timeVariableName + ')';
	};

	LinearCurve.prototype.getValueAt = function (t/*, lerpValue*/) {
		return this.k * (t - this.timeOffset) + this.m;
	};

	LinearCurve.prototype.getIntegralValueAt = function (t/*, lerpValue*/) {
		var x = (t - this.timeOffset);
		var k = this.k;
		var m = this.m;
		return 0.5 * k * x * x + m * x;
	};

	return LinearCurve;
});
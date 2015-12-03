define([
	'goo/addons/particlepack/Curve'
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
		 * Slope of the line
		 * @type {number}
		 */
		this.k = options.k !== undefined ? options.k : 1;

		/**
		 * Offset of the line.
		 * @type {number}
		 */
		this.m = options.m !== undefined ? options.m : 0;
	}
	LinearCurve.prototype = Object.create(Curve.prototype);
	LinearCurve.prototype.constructor = LinearCurve;

	LinearCurve.prototype.toGLSL = function (timeVariableName) {
		return '(' + this.numberToGLSL(this.k) + '*' + timeVariableName + '+' + this.numberToGLSL(this.m) + ')';
	};

	LinearCurve.prototype.integralToGLSL = function (timeVariableName) {
		var k = this.numberToGLSL(this.k);
		var m = this.numberToGLSL(this.m);
		return '(' + k + '*' + timeVariableName + '*' + timeVariableName + '*0.5+' + m + '*' + timeVariableName + ')';
	};

	LinearCurve.prototype.getValueAt = function (t) {
		return this.k * (t - this.timeOffset) + this.m;
	};

	LinearCurve.prototype.getIntegralValueAt = function (t) {
		var x = (t - this.timeOffset);
		var k = this.k;
		var m = this.m;
		return 0.5 * k * x * x + m * x;
	};

	return LinearCurve;
});
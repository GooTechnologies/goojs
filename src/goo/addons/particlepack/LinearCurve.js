define([
	'./Curve'
], function (
	Curve
) {
	'use strict';

	function LinearCurve(options) {
		options = options || {};

		Curve.apply(this);

		this.k = options.k !== undefined ? options.k : 1;
		this.m = options.m !== undefined ? options.m : 0;
	}
	LinearCurve.prototype = Object.create(Curve.prototype);
	LinearCurve.prototype.constructor = LinearCurve;

	LinearCurve.prototype.toGLSL = function (timeVariableName) {
		return this.numberToGLSL(this.k) + '*' + timeVariableName + '+' + this.numberToGLSL(this.m);
	};

	return LinearCurve;
});
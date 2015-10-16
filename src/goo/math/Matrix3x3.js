define([
	'goo/math/Matrix3'
], function (
	Matrix3
) {
	'use strict';

	function Matrix3x3(){
		console.warn('Matrix3x3 has been renamed to Matrix3.');
		Matrix3.apply(this, arguments);
	}
	Matrix3x3.prototype = Object.create(Matrix3.prototype);
	Matrix3x3.prototype.constructor = Matrix3x3;

	return Matrix3x3;
});

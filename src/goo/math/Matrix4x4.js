define([
	'goo/math/Matrix4'
], function (
	Matrix4
) {
	'use strict';

	function Matrix4x4(){
		console.warn('Matrix4x4 has been renamed to Matrix4.');
		Matrix4.apply(this, arguments);
	}
	Matrix4x4.prototype = Object.create(Matrix4.prototype);
	Matrix4x4.prototype.constructor = Matrix4x4;
	for (var x in Matrix4) {
		Matrix4x4[x] = Matrix4[x];
	}

	return Matrix4x4;
});

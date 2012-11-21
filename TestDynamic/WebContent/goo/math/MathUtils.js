define(['goo/math/Vector3', 'goo/math/Matrix3x3', 'goo/math/Matrix4x4'], function(Vector3, Matrix3x3, Matrix4x4) {
	"use strict";

	function MathUtils() {
	}

	MathUtils.DEG_TO_RAD = Math.PI / 180.0;
	MathUtils.RAD_TO_DEG = 180.0 / Math.PI;

	MathUtils.prototype.multiply = function(a, b) {
	};

	return MathUtils;
});
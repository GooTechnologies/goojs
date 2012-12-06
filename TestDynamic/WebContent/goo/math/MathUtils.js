define(['goo/math/Vector3', 'goo/math/Matrix3x3', 'goo/math/Matrix4x4'], function(Vector3, Matrix3x3, Matrix4x4) {
	"use strict";

	function MathUtils() {
	}

	MathUtils.DEG_TO_RAD = Math.PI / 180.0;
	MathUtils.RAD_TO_DEG = 180.0 / Math.PI;

	MathUtils.HALF_PI = 0.5 * Math.PI;
	MathUtils.TWO_PI = 2.0 * Math.PI;

	MathUtils.lerp = function(percent, startValue, endValue) {
		if (startValue == endValue) {
			return startValue;
		}
		return (1.0 - percent) * startValue + percent * endValue;
	};

	return MathUtils;
});
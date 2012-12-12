define(['goo/math/Vector3', 'goo/math/Matrix3x3', 'goo/math/Matrix4x4'], function(Vector3, Matrix3x3, Matrix4x4) {
	"use strict";

	function MathUtils() {
	}

	MathUtils.DEG_TO_RAD = Math.PI / 180.0;
	MathUtils.RAD_TO_DEG = 180.0 / Math.PI;

	MathUtils.HALF_PI = 0.5 * Math.PI;
	MathUtils.TWO_PI = 2.0 * Math.PI;

	// REVIEW: Confusing name, percent sounds like range is 0..100
	MathUtils.lerp = function(percent, startValue, endValue) {
		if (startValue == endValue) {
			return startValue;
		}
		return (1.0 - percent) * startValue + percent * endValue;
	};

	MathUtils.clamp = function(val, min, max) {
		return val < min ? min : val > max ? max : val;
	};

	/**
	 * @description plot a given value on the cubic S-curve: 3t^2 - 2t^3
	 * @param t our input value
	 * @return the plotted value
	 */
	MathUtils.scurve3 = function(t) {
		var t2 = t * t;
		var t3 = t * t2;
		return 3. * t2 - 2. * t3;
	};

	/**
	 * @description plot a given value on the quintic S-curve: 6t^5 - 15t^4 + 10t^3
	 * @param t our input value
	 * @return the plotted value
	 */
	MathUtils.scurve5 = function(t) {
		var t3 = t * t * t;
		var t4 = t * t3;
		var t5 = t * t4;
		return 6. * t5 - 15. * t4 + 10. * t3;
	};

	return MathUtils;
});

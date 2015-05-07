define([], function () {
	'use strict';

	/**
	 * Contains Tween utility functions
	 */
	function TweenUtil() {}

	TweenUtil.getApproxDerivative = function (tweenFunction, t, epsilon) {
		if (t - epsilon > 0 && t + epsilon < 1) {
			// Midpoint
			return (tweenFunction(t + epsilon) - tweenFunction(t - epsilon)) / (2 * epsilon);
		} else if (t > 0.5) {
			// Upper
			t = Math.min(1, t);
			return (tweenFunction(t) - tweenFunction(t - epsilon)) / epsilon;
		} else {
			// Lower
			t = Math.max(0, t);
			return (tweenFunction(t + epsilon) - tweenFunction(t)) / epsilon;
		}
	};

	return TweenUtil;

});

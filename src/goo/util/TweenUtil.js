define([], function () {
	'use strict';

	/**
	 * Contains Tween utility functions
	 */
	function TweenUtil() {}

	/**
	 * Get an approximation of the derivative of a Tween function using the midpoint method.
	 * @param  {Function} tweenFunction
	 * @param  {number} t Where to evaluate the derivative. A number between 0 and 1.
	 * @param  {number} epsilon A small number.
	 * @return {number}
	 */
	TweenUtil.getApproxDerivative = function (tweenFunction, t, epsilon) {
		if (t - epsilon > 0 && t + epsilon < 1) {
			// Midpoint
			return (tweenFunction(t + epsilon) - tweenFunction(t - epsilon)) / (2 * epsilon);
		} else if (t > 0.5) {
			// Upper
			t = Math.min(1, t);
			return (tweenFunction(t) - tweenFunction(t - epsilon)) / epsilon;
		}

		// Lower
		t = Math.max(0, t);
		return (tweenFunction(t + epsilon) - tweenFunction(t)) / epsilon;
	};

	return TweenUtil;

});

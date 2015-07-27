define([
	'goo/math/Vector4'
], function (
	Vector4
) {
	'use strict';

	/**
	 * Describes a cubic spline
	 * @param {Array<Vector>} controlPoints
	 */
	function Spline(controlPoints) {
		// array of any sort of Vector
		this.controlPoints = controlPoints;
		this.segments = (this.controlPoints.length - 1) / 3;
	}

	(function () {
		// should be of the same type as p0, p1, p2
		// using Vector4 here because it can hold instances of Vector2/3/4
		var term0 = new Vector4();
		var term1 = new Vector4();
		var term2 = new Vector4();

		/**
		 * Interpolate on a quadratic Bezier curve
		 * @param {Vector} p0 First control point
		 * @param {Vector} p1 Second control point
		 * @param {Vector} p2 Third control point
		 * @param {number} t Takes values between 0 and 1
		 * @param {Vector} store Vector to store the result to
		 */
		Spline.quadraticInterpolation = function (p0, p1, p2, t, store) {
			// B(t) =
			// (1 - t)^2 * P0 +
			// 2 * (1 - t) * t * P1 +
			// t^2 * P2

			var t2 = t * t;

			var it = 1 - t;
			var it2 = it * it;

			p0.copyTo(term0);
			term0.scale(it2);

			p1.copyTo(term1);
			term1.scale(it * t * 2);

			p2.copyTo(term2);
			term2.scale(t2);

			store.setVector(term0).addVector(term1).addVector(term2);
		};
	})();

	(function () {
		// should be of the same type as p0, p1, p2, p3
		// using Vector4 here because it can hold instances of Vector2/3/4
		var term0 = new Vector4();
		var term1 = new Vector4();
		var term2 = new Vector4();
		var term3 = new Vector4();

		/**
		 * Interpolate on a quadratic Bezier curve
		 * @param {Vector} p0 First control point
		 * @param {Vector} p1 Second control point
		 * @param {Vector} p2 Third control point
		 * @param {Vector} p3 Fourth control point
		 * @param {number} t Takes values between 0 and 1
		 * @param {Vector} store Vector to store the result to
		 */
		Spline.cubicInterpolation = function (p0, p1, p2, p3, t, store) {
			// B(t) =
			// (1 - t)^3 * P0 +
			// 3 * (1 - t)^2 * t * P1 +
			// 3 * (1 - t) * t^2 * P2 +
			// t^3 * P3

			var t2 = t * t;
			var t3 = t2 * t;

			var it = 1 - t;
			var it2 = it * it;
			var it3 = it2 * it;

			p0.copyTo(term0);
			term0.scale(it3);

			p1.copyTo(term1);
			term1.scale(it2 * t * 3);

			p2.copyTo(term2);
			term2.scale(it * t2 * 3);

			p3.copyTo(term3);
			term3.scale(t3);

			store.setVector(term0).addVector(term1).addVector(term2).addVector(term3);
		};
	})();

	/**
	 * Stores the coordinates of the point on the spline at a given t
	 * @param {number} t Takes values between 0 and 1
	 * @param {Vector} store A vector to store the result in
	 */
	Spline.prototype.getPoint = function (t, store) {
		if (t <= 0) {
			store.setVector(this.controlPoints[0]);
			return;
		} else if (t >= 1) {
			store.setVector(this.controlPoints[this.controlPoints.length - 1]);
			return;
		}

		var point = this.segments * t;
		var index = Math.floor(point);
		var fraction = point - index;

		var p0 = this.controlPoints[index * 3 + 0];
		var p1 = this.controlPoints[index * 3 + 1];
		var p2 = this.controlPoints[index * 3 + 2];
		var p3 = this.controlPoints[index * 3 + 3];

		Spline.cubicInterpolation(p0, p1, p2, p3, fraction, store);
	};

	return Spline;
});

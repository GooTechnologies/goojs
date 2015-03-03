define([
	'goo/math/splines/Spline'
], function (
	Spline
) {
	'use strict';

	/**
	 * Provides a way to interpolate on a spline with constant speed
	 * @param {Spline} spline Spline to interpolate across
	 * @param {number} [substepSize=0.01] substepSize The size of the substep used to approximate movement across the spline.
	 * Small values of this parameter lead to more substeps and better precision (at the cost of more computations).
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/math/SplineWalker/SplineWalker-vtest.html Comparison or normal interpolation vs using the SplineWalker
	 */
	function SplineWalker(spline, substepSize) {
		this.substepSize = substepSize || 0.01;
		this._spline = spline;
		this._segment = 0;
		this._localT = 0;
		this._pointer = spline.controlPoints[0].clone();
	}

	/**
	 * Performs interpolation according to the internal state
	 * @private
	 * @param {Vector} store
	 */
	SplineWalker.prototype._localInterpolation = function (store) {
		var p0 = this._spline.controlPoints[this._segment * 3 + 0];
		var p1 = this._spline.controlPoints[this._segment * 3 + 1];
		var p2 = this._spline.controlPoints[this._segment * 3 + 2];
		var p3 = this._spline.controlPoints[this._segment * 3 + 3];
		Spline.cubicInterpolation(p0, p1, p2, p3, this._localT, store);
	};

	/**
	 * Performs a step and updates the internal state
	 * @private
	 * @param {Vector} stepSize
	 * @param {Vector} store
	 */
	SplineWalker.prototype._step = function (stepSize, store) {
		this._localT += stepSize;

		if (this._localT > 1) {
			this._localT -= 1;
			this._segment++;

			if (this._segment >= this._spline.segments) {
				store.copy(this._spline.controlPoints[this._spline.controlPoints.length - 1]);
				return;
			}
		}

		this._localInterpolation(store);
	};

	/**
	 * Advances the walker by the provided distance and store the new location in the second parameter
	 * @param {number} distance Distance to "walk" on the spline; must be positive
	 * @param {Vector} store The vector to use to store the resulting position; must have the same type as the control points of the spline
	 */
	SplineWalker.prototype.advance = function (distance, store) {
		var walkedSoFar = 0;
		while (walkedSoFar < distance && this._segment < this._spline.segments) {
			this._step(this.substepSize, store);
			walkedSoFar += this._pointer.distance(store);
			this._pointer.copy(store);
		}
	};

	/**
	 * Returns whether the walker can still advance on the spline
	 * @returns {boolean}
	 */
	SplineWalker.prototype.canWalk = function () {
		return this._segment < this._spline.segments;
	};

	return SplineWalker;
});

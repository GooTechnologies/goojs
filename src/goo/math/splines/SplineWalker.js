define([
	'goo/math/splines/Spline',
	'goo/math/MathUtils'
], function (
	Spline,
	MathUtils
) {
	'use strict';

	/**
	 * Provides a way to interpolate on a spline with constant speed
	 * @param {Spline} spline Spline to interpolate across
	 * @param {number} [substepSize=0.01] substepSize The size of the substep used to approximate movement across the spline.
	 * @param {number} [loop=false]
	 * Small values of this parameter lead to more substeps and better precision (at the cost of more computations).
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/math/SplineWalker/SplineWalker-vtest.html Comparison or normal interpolation vs using the SplineWalker
	 */
	function SplineWalker(spline, substepSize, loop) {
		this.substepSize = substepSize !== undefined ? substepSize : 0.01;
		this.loop = loop !== undefined ? loop : false;

		this._spline = spline;
		this._segment = 0;
		this._localT = 0;
		this._pointer = spline.controlPoints[0].clone();
		this._lastPointer = spline.controlPoints[0].clone();
		this._distance = 0;
		this._fixedDistance = 0;
		this._lastStepSize = -1;
	}

	/**
	 * Performs interpolation according to the internal state
	 * @private
	 * @param {Vector} store
	 */
	SplineWalker.prototype._localInterpolation = function (store) {
		var segment = this._segment;
		var spline = this._spline;
		var p0 = spline.controlPoints[segment * 3 + 0];
		var p1 = spline.controlPoints[segment * 3 + 1];
		var p2 = spline.controlPoints[segment * 3 + 2];
		var p3 = spline.controlPoints[segment * 3 + 3];
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
			if (this.loop) {
				this._segment = this._segment % this._spline.segments;
			}
			if (this._segment >= this._spline.segments && !this.loop) {
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

		var pointer = this._pointer;
		var lastPointer = this._lastPointer;

		this._distance += distance;
		this._lastStepSize  = this._lastStepSize < 0 ? distance : this._lastStepSize;

		if (this.loop && this._segment >= this._spline.segments) {
			this.restart();
		}

		while (this._fixedDistance < this._distance && this._segment < this._spline.segments) {
			this._step(this.substepSize, store);
			this._lastStepSize = pointer.distance(store);
			this._fixedDistance += this._lastStepSize;
			lastPointer.copy(pointer);
			pointer.copy(store);
		}

		var t = MathUtils.clamp((this._fixedDistance - this._distance) / this._lastStepSize, 0, 1);
		store.copy(pointer).lerp(lastPointer, t);
	};

	/**
	 * Returns whether the walker can still advance on the spline
	 * @returns {boolean}
	 */
	SplineWalker.prototype.canWalk = function () {
		if (this.loop) {
			return true;
		}
		return this._segment < this._spline.segments;
	};

	/**
	 * Restart the spline.
	 */
	SplineWalker.prototype.restart = function () {
		this._segment = 0;
		if (this.loop) {
			this._distance = 0;
			this._fixedDistance = 0;
			this._lastStepSize = -1;
			var spline = this._spline;
			this._pointer.copy(spline.controlPoints[0]);
			this._lastPointer.copy(spline.controlPoints[0]);
		}
	};

	return SplineWalker;
});

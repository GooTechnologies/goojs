define([
	'goo/math/spline/Spline'
], function (
	Spline
) {
	'use strict';

	function SplineWalker(spline, substepSize) {
		this.substepSize = substepSize || 0.01;
		this._spline = spline;
		this._segment = 0;
		this._localT = 0;
		this._lastPoint = spline.controlPoints[0].clone();
		this._pointer = this._lastPoint.clone();
	}

	SplineWalker.prototype._localInterpolation = function (store) {
		var p0 = this._spline.controlPoints[this._segment * 3 + 0];
		var p1 = this._spline.controlPoints[this._segment * 3 + 1];
		var p2 = this._spline.controlPoints[this._segment * 3 + 2];
		var p3 = this._spline.controlPoints[this._segment * 3 + 3];
		Spline.cubicInterpolation(p0, p1, p2, p3, this._localT, store);
	};

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

	SplineWalker.prototype.advance = function (distance, store) {
		//var pointer = this._lastPoint.clone();

		var walkedSoFar = 0;
		while (walkedSoFar < distance && this._segment < this._spline.segments) {
			this._step(this.substepSize, store);
			walkedSoFar += this._pointer.distance(store);
			this._pointer.copy(store);
		}

		this._lastPoint.copy(store);
	};

	SplineWalker.prototype.canWalk = function () {
		return this._segment < this._spline.segments;
	};

	return SplineWalker;
});

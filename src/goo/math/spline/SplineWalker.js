define([
	'goo/math/spline/Spline'
], function (
	Spline
) {
	'use strict';

	function SplineWalker(spline) {
		this._spline = spline;
		this._segment = 0;
		this._localT = 0;
	}

	function interpolate(spline, segment, localT, store) {
		var p0 = spline.controlPoints[segment * 3 + 0];
		var p1 = spline.controlPoints[segment * 3 + 1];
		var p2 = spline.controlPoints[segment * 3 + 2];
		var p3 = spline.controlPoints[segment * 3 + 3];
		Spline.cubicInterpolation(p0, p1, p2, p3, localT, store);
	}

	var SUBSTEPS = 10;
	SplineWalker.prototype.advance = function (distance, store) {
		var currentPoint = new store.constructor();
		var lastPoint = new store.constructor();

		var walkedSoFar = 0;
		while (walkedSoFar < distance) {
			interpolate(this.spline, this._segment, this._localT, currentPoint);
			var stepLength = lastPoint.distance(currentPoint);
			walkedSoFar += stepLength;

		}

	};

	return SplineWalker;
});

define([
], function (
) {
	'use strict';

	function numberToGLSL(n) {
		return (n + '').indexOf('.') === -1 ? n + '.0' : n + '';
	}

	function CurveSet() {
		/**
		 * @type {Array<Curve>}
		 */
		this.segments = [];
	}

	CurveSet.prototype = {
		addSegment: function (curve) {
			this.segments.push(curve);
			this.sort();
		},
		removeSegment: function (i) {
			this.segments.splice(i, 1);
		},
		sort: function () {
			this.segments = this.segments.sort(function (curveA, curveB) {
				return curveA.timeOffset - curveB.timeOffset;
			});
		},
		toGLSL: function (timeVariableName) {
			var segments = this.segments;
			var glsl = [];
			for (var i = 0; i < segments.length; i++) {
				var a = segments[i];
				var t0 = numberToGLSL(a.timeOffset);
				var t1 = "1.0";
				if (i < segments.length - 1) {
					t1 = numberToGLSL(segments[i + 1].timeOffset);
				}
				glsl.push(
					'step(' + t0 + ',' + timeVariableName + ')*step(-' + t1 + ',-' + timeVariableName + ')*' + a.toGLSL(timeVariableName)
				);
			}
			return glsl.join('+');
		},
		getValueAt: function (t) {
			// Find the matching segment
			var segments = this.segments;
			for (var i = 0; i < segments.length - 1; i++) {
				var a = segments[i];
				var b = segments[i + 1];
				if (a.timeOffset <= t && b.timeOffset > t) {
					return this.segments[i].getValueAt(t);
				}
			}
			return this.segments[segments.length - 1].getValueAt(t);
		},
		getIntegralValueAt: function (t) {
			// Add all integral values until the last segment
			var segments = this.segments;
			var value = 0;
			for (var i = 0; i < segments.length; i++) {
				var a = segments[i];
				var t1 = 1;
				if (i < segments.length - 1) {
					t1 = segments[i + 1].timeOffset;
				}
				if (a.timeOffset <= t && t1 > t) {
					value += this.segments[i].getIntegralValueAt(t);
					break;
				} else if (a.timeOffset <= t) {
					value += this.segments[i].getIntegralValueAt(t1);
				}
			}
			return value;
		}
	};

	return CurveSet;
});
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
			for (var i = 0; i < segments.length - 1; i++) {
				glsl.push(
					'step(' + numberToGLSL(segments[i].timeOffset) + ',' + timeVariableName + ')*step(-' + numberToGLSL(segments[i + 1].timeOffset) + ',-' + timeVariableName + ')*' + segments[i].toGLSL(timeVariableName)
				);
			}
			var lastSegment = segments[segments.length - 1];
			glsl.push(
				'step(' + lastSegment.timeOffset + ',' + timeVariableName + ')*step(-1.0,-' + timeVariableName + ')*' + lastSegment.toGLSL(timeVariableName)
			);
			return glsl.join('+');
		},
		getValueAt: function (t) {
			// Find the matching segment
			var segments = this.segments;
			for (var i = 0; i < segments.length - 1; i++) {
				var a = segments[i];
				var b = segments[i + 1];
				if (a.timeOffset >= t && b.timeOffset < t) {
					return this.segments[i].getValueAt(t);
				}
			}
			return 0;
		}
	};

	return CurveSet;
});
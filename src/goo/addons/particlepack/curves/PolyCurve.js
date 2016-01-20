define([
	'goo/addons/particlepack/curves/Curve'
], function (
	Curve
) {
	'use strict';

	/**
	 * A collection of Curve instances. Used to connect different types curves, joining them at their given time offsets.
	 * @constructor
	 * @extends Curve
	 * @param {object} [options]
	 * @param {Array<Curve>} [options.segments]
	 */
	function PolyCurve(options) {
		options = options || {};

		Curve.call(this, options);

		/**
		 * @type {Array<Curve>}
		 */
		this.segments = options.segments ? options.segments.map(function (curve) {
			return curve.clone();
		}) : [];
	}

	PolyCurve.prototype = {
		
		clone: function () {
			return new PolyCurve(this);
		},

		/**
		 * @param {Curve} curve
		 */
		addSegment: function (curve) {
			this.segments.push(curve);
			this.sort();
		},
		
		/**
		 * @param {number} i
		 */
		removeSegment: function (i) {
			this.segments.splice(i, 1);
		},
		
		/**
		 * Sorts the segments depending on their timeOffset.
		 */
		sort: function () {
			this.segments = this.segments.sort(function (curveA, curveB) {
				return curveA.timeOffset - curveB.timeOffset;
			});
		},

		/**
		 * Returns a GLSL expression that gives the value of the curve at a given time.
		 * @param {string} timeVariableName
		 * @param {string} lerpVariableName
		 */
		toGLSL: function (timeVariableName, lerpValueVariableName) {
			var segments = this.segments;
			var glsl = [];
			for (var i = 0; i < segments.length; i++) {
				var a = segments[i];
				var t0 = Curve.numberToGLSL(a.timeOffset);
				var t1 = "1.0";
				if (i < segments.length - 1) {
					t1 = Curve.numberToGLSL(segments[i + 1].timeOffset);
				}
				glsl.push(
					a.toGLSL(timeVariableName, lerpValueVariableName)
				);
			}
			return glsl.join('+');
		},

		/**
		 * Returns a GLSL expression that gives the integral value of the curve at a given time.
		 * @param {string} timeVariableName
		 * @param {string} lerpVariableName
		 */
		integralToGLSL: function (timeVariableName, lerpValueVariableName) {
			var segments = this.segments;
			var glsl = [];
			for (var i = 0; i < segments.length; i++) {
				var a = segments[i];
				var t0 = Curve.numberToGLSL(a.timeOffset);
				var t1 = "1.0";
				if (i < segments.length - 1) {
					t1 = Curve.numberToGLSL(segments[i + 1].timeOffset);
				}
				glsl.push(
					a.integralToGLSL(
						'clamp(' + timeVariableName + ',' + t0 + ',' + t1 + ')',
						lerpValueVariableName
					)
				);
			}
			return glsl.join('+');
		},

		/**
		 * Get the value of the curve at a given time.
		 * @param {number} t
		 * @param {number} lerpValue
		 * @returns {number}
		 */
		getValueAt: function (t, lerpValue) {
			// Find the matching segment
			var segments = this.segments;
			for (var i = 0; i < segments.length - 1; i++) {
				var a = segments[i];
				var b = segments[i + 1];
				if (a.timeOffset <= t && b.timeOffset > t) {
					return this.segments[i].getValueAt(t, lerpValue);
				}
			}
			return this.segments[segments.length - 1].getValueAt(t, lerpValue);
		},

		/**
		 * Get the integral value of the curve at a given time.
		 * @param {number} t
		 * @param {number} lerpValue
		 * @returns {number}
		 */
		getIntegralValueAt: function (t, lerpValue) {
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
					value += this.segments[i].getIntegralValueAt(t, lerpValue);
					break;
				} else {
					value += this.segments[i].getIntegralValueAt(t1, lerpValue);
				}
			}
			return value;
		}
	};

	return PolyCurve;
});
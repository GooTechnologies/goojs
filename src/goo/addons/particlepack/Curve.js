define([
], function (
) {
	'use strict';

	/**
	 * A curve that has a time-dependent value (time is always between 0 and 1), and can be translated into GLSL code.
	 * @constructor
	 * @param {object} [options]
	 * @param {number} [options.timeOffset]
	 */
	function Curve(options) {
		options = options || {};

		/**
		 * The offset of this curve, when used in a CurveSet. Needs to be a number between 0 and 1.
		 * @type {Number}
		 */
		this.timeOffset = options.timeOffset || 0;
	}

	Curve.prototype = {

		/**
		 * Convert the curve into GLSL code.
		 * @param {number} timeVariableName
		 * @return {string}
		 */
		toGLSL: function (/*timeVariableName*/) {
			return '0.0';
		},

		/**
		 * Convert a number to GLSL code
		 * @param {number} n
		 * @return {string}
		 */
		numberToGLSL: function (n) {
			return (n + '').indexOf('.') === -1 ? n + '.0' : n + '';
		},

		/**
		 * Get a value at a given point in time
		 * @param {number} t
		 * @return {number}
		 */
		getValueAt: function (/*t*/) {
			return 0; // To be extended by child classes
		}
	};

	return Curve;
});
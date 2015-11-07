define([
], function (
) {
	'use strict';

	function Curve(options) {
		options = options || {};

		/**
		 * The offset of this curve, when used in a CurveSet. Needs to be a number between 0 and 1.
		 * @type {Number}
		 */
		this.timeOffset = options.timeOffset || 0;
	}

	Curve.prototype = {
		toGLSL: function (/*timeVariableName*/) {
			return '0.0';
		},
		numberToGLSL: function (n) {
			return (n + '').indexOf('.') === -1 ? n + '.0' : n + '';
		},
		getValueAt: function (/*t*/) {
			return 0; // To be extended by child classes
		}
	};

	return Curve;
});
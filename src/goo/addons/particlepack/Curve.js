define([
], function (
) {
	'use strict';

	function Curve() {

	}

	Curve.prototype = {
		toGLSL: function (timeVariableName) {
			return timeVariableName;
		},
		numberToGLSL: function (n) {
			return (n + '').indexOf('.') === -1 ? n + '.0' : n + '';
		}
	};

	return Curve;
});
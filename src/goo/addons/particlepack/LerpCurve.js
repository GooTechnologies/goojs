define([
	'goo/addons/particlepack/Curve'
], function (
	Curve
) {
	'use strict';

	/**
	 * Curve that can lerp between two other curves.
	 * @class
	 * @constructor
	 * @extends Curve
	 * @param {object} [options]
	 * @param {number} [options.lerpValue]
	 */
	function LerpCurve(options) {
		options = options || {};

		Curve.call(this, options);

		/**
		 * @type {Curve}
		 */
		this.curveA = options.curveA !== undefined ? options.curveA : 0;
		
		/**
		 * @type {Curve}
		 */
		this.curveB = options.curveB !== undefined ? options.curveB : 0;
	}
	LerpCurve.prototype = Object.create(Curve.prototype);
	LerpCurve.prototype.constructor = LerpCurve;

	LerpCurve.prototype.toGLSL = function (timeVariableName, lerpVariableName) {
		return 'mix(' + this.curveA.toGLSL(timeVariableName) + ',' + this.curveB.toGLSL(timeVariableName) + ', ' + lerpVariableName + ')';
	};

	LerpCurve.prototype.integralToGLSL = function (timeVariableName, lerpVariableName) {
		return 'mix(' + this.curveA.integralToGLSL(timeVariableName, lerpVariableName) + ',' + this.curveB.integralToGLSL(timeVariableName, lerpVariableName) + ', ' + lerpVariableName + ')';
	};

	LerpCurve.prototype.getValueAt = function (t, lerpValue) {
		return MathUtils.lerp(lerpValue, this.curveA.getValueAt(t), this.curveB.getValueAt(t));
	};

	LerpCurve.prototype.getIntegralValueAt = function (t, lerpValue) {
		return MathUtils.lerp(lerpValue, this.curveA.getIntegralValueAt(t), this.curveB.getIntegralValueAt(t));
	};

	return LerpCurve;
});
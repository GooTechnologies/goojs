var Curve = require('../../../addons/particlepack/curves/Curve');
var MathUtils = require('../../../math/MathUtils');

/**
 * Curve that can lerp between two other curves.
 * @class
 * @constructor
 * @extends Curve
 * @param {object} [options]
 * @param {Curve} [options.curveA]
 * @param {Curve} [options.curveB]
 */
function LerpCurve(options) {
	options = options || {};

	Curve.call(this, options);

	/**
	 * @type {Curve}
	 */
	this.curveA = options.curveA !== undefined ? options.curveA.clone() : null;

	/**
	 * @type {Curve}
	 */
	this.curveB = options.curveB !== undefined ? options.curveB.clone() : null;
}
LerpCurve.prototype = Object.create(Curve.prototype);
LerpCurve.prototype.constructor = LerpCurve;

LerpCurve.prototype.toGLSL = function (timeVariableName, lerpVariableName) {
	return 'mix(' + this.curveA.toGLSL(timeVariableName, lerpVariableName) + ',' + this.curveB.toGLSL(timeVariableName, lerpVariableName) + ',' + lerpVariableName + ')';
};

LerpCurve.prototype.integralToGLSL = function (timeVariableName, lerpVariableName) {
	return 'mix(' + this.curveA.integralToGLSL(timeVariableName, lerpVariableName) + ',' + this.curveB.integralToGLSL(timeVariableName, lerpVariableName) + ',' + lerpVariableName + ')';
};

LerpCurve.prototype.getValueAt = function (t, lerpValue) {
	return MathUtils.lerp(lerpValue, this.curveA.getValueAt(t, lerpValue), this.curveB.getValueAt(t, lerpValue));
};

LerpCurve.prototype.getIntegralValueAt = function (t, lerpValue) {
	return MathUtils.lerp(lerpValue, this.curveA.getIntegralValueAt(t, lerpValue), this.curveB.getIntegralValueAt(t, lerpValue));
};

module.exports = LerpCurve;
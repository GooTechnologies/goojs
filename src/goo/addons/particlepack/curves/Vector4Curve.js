var ConstantCurve = require('../../../addons/particlepack/curves/ConstantCurve');
var Curve = require('../../../addons/particlepack/curves/Curve');
var ObjectUtils = require('../../../util/ObjectUtils');

/**
 * Three scalar curves. Can be converted to a vec4-valued expression in GLSL code.
 * @class
 * @constructor
 * @param {object} [options]
 * @param {Curve} [options.x]
 * @param {Curve} [options.y]
 * @param {Curve} [options.z]
 * @param {Curve} [options.w]
 */
function Vector4Curve(options) {
	options = options || {};

	options = ObjectUtils.clone(options);
	options.type = 'vec4';
	Curve.call(this, options);

	this.x = options.x ? options.x.clone() : new ConstantCurve();
	this.y = options.y ? options.y.clone() : new ConstantCurve();
	this.z = options.z ? options.z.clone() : new ConstantCurve();
	this.w = options.w ? options.w.clone() : new ConstantCurve({ value: 1 });

	if (this.x.type !== 'float' || this.y.type !== 'float' || this.z.type !== 'float' || this.w.type !== 'float') {
		throw new Error('Vector4Curve must have scalar components.');
	}
}
Vector4Curve.prototype = Object.create(Curve.prototype);
Vector4Curve.prototype.constructor = Vector4Curve;

Vector4Curve.prototype.toGLSL = function (timeVariableName, lerpValueVariableName) {
	return 'vec4(' + [this.x, this.y, this.z, this.w].map(function (c) { return c.toGLSL(timeVariableName, lerpValueVariableName); }).join(',') + ')';
};

Vector4Curve.prototype.integralToGLSL = function (timeVariableName, lerpValueVariableName) {
	return 'vec4(' + [this.x, this.y, this.z, this.w].map(function (c) { return c.integralToGLSL(timeVariableName, lerpValueVariableName); }).join(',') + ')';
};

Vector4Curve.prototype.getVec4ValueAt = function (t, lerpValue, store) {
	store.setDirect(
		this.x.getValueAt(t, lerpValue),
		this.y.getValueAt(t, lerpValue),
		this.z.getValueAt(t, lerpValue),
		this.w.getValueAt(t, lerpValue)
	);
};

Vector4Curve.prototype.getVec4IntegralValueAt = function (t, lerpValue, store) {
	store.setDirect(
		this.x.getIntegralValueAt(t, lerpValue),
		this.y.getIntegralValueAt(t, lerpValue),
		this.z.getIntegralValueAt(t, lerpValue),
		this.w.getIntegralValueAt(t, lerpValue)
	);
};

module.exports = Vector4Curve;
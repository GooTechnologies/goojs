
	/**
	 * A curve that has a time-dependent value (time is always between 0 and 1), and can be translated into GLSL code.
	 * @constructor
	 * @param {object} [options]
	 * @param {string} [options.type]
	 * @param {number} [options.timeOffset=0]
	 */
	function Curve(options) {
		options = options || {};

		/**
		 * The value type. Should be 'float', 'vec3' or 'vec4' to indicate which getValueAt method to use.
		 */
		this.type = options.type || 'float';

		/**
		 * The offset of this curve, when used in a PolyCurve. Needs to be a number between 0 and 1.
		 * @type {Number}
		 */
		this.timeOffset = options.timeOffset || 0;
	}

	/**
	 * Convert a number to GLSL code.
	 * @param {number} n
	 * @returns {string}
	 */
	Curve.numberToGLSL = function (n) {
		return (n + '').indexOf('.') === -1 ? n + '.0' : n + '';
	};

	Curve.prototype = {

		/**
		 * Convert the curve into GLSL code.
		 * @param {number} timeVariableName
		 * @returns {string}
		 */
		toGLSL: function (/*timeVariableName, lerpVariableName*/) {
			return '0.0';
		},

		/**
		 * Get a value at a given point in time
		 * @param {number} t
		 * @param {number} lerpValue
		 * @returns {number}
		 */
		getValueAt: function (/*t, lerpValue*/) {
			return 0; // To be extended by child classes
		},

		/**
		 * Get a vec4 value at a given point in time
		 * @param {number} t
		 * @param {number} lerpValue
		 * @param {Vector4} store
		 */
		getVec4ValueAt: function (/*t, lerpValue, store*/) {},

		/**
		 * @param {number} t
		 * @param {number} lerpValue
		 * @returns {number}
		 */
		getIntegralValueAt: function (/*t, lerpValue*/) {
			return 0; // To be extended by child classes
		},

		/**
		 * @param {number} t
		 * @param {number} lerpValue
		 * @param {Vector4} store
		 */
		getVec4IntegralValueAt: function (/*t, lerpValue, store*/) {},

		/**
		 * @returns {Curve}
		 */
		clone: function() {
			return new this.constructor(this);
		}
	};

	export default Curve;
/*jshint bitwise: false */
var Noise = require('./Noise');



/**
 * Value noise is simpler and computationally lighter than Perlin noise yet produce visually similar results when used in fractals.
 *  Only used to define the class. Should never be instantiated.
 */
function ValueNoise() {
	Noise.call(this);
}

ValueNoise.prototype = Object.create(Noise.prototype);
ValueNoise.prototype.constructor = ValueNoise;

ValueNoise.sources = [
	0.0 / 15.0, 1.0 / 15.0, 2.0 / 15.0, 3.0 / 15.0, 4.0 / 15.0,
	5.0 / 15.0, 6.0 / 15.0, 7.0 / 15.0, 8.0 / 15.0, 9.0 / 15.0,
	10.0 / 15.0, 11.0 / 15.0, 12.0 / 15.0, 13.0 / 15.0, 14.0 / 15.0,
	15.0 / 15.0
];

/**
 * Evaluates the one-dimensional value noise function at a specific position.
 * @param {Float} px Evaluation position x.
 * @param {Float} scale Base scale. Greater scale values will pull the sources (hills and valleys) further apart.
 * @returns {Float} Noise value.
 */
ValueNoise.evaluate1d = function (px, scale) {
	var x = Noise.split(px / scale);

	var i0000 = Noise.shifter[x.i0 & 0xFF] & 0x0F;
	var i0001 = Noise.shifter[x.i1 & 0xFF] & 0x0F;

	var result = 0.0;

	result += x.f0 * ValueNoise.sources[i0000];
	result += x.f1 * ValueNoise.sources[i0001];

	return result;
};

/**
 * Evaluates the two-dimensional value noise function at a specific position.
 * @param {Float} px Evaluation position x.
 * @param {Float} py Evaluation position y.
 * @param {Float} scale Base scale. Greater scale values will pull the sources (hills and valleys) further apart.
 * @returns {Float} Noise value.
 */
ValueNoise.evaluate2d = function (px, py, scale) {
	var x = Noise.split(px / scale);
	var y = Noise.split(py / scale);

	var i0000 = Noise.shifter[Noise.shifter[y.i0 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0001 = Noise.shifter[Noise.shifter[y.i0 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i0010 = Noise.shifter[Noise.shifter[y.i1 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0011 = Noise.shifter[Noise.shifter[y.i1 & 0xFF] + x.i1 & 0xFF] & 0x0F;

	var result = 0.0;

	result += y.f0 * x.f0 * ValueNoise.sources[i0000];
	result += y.f0 * x.f1 * ValueNoise.sources[i0001];
	result += y.f1 * x.f0 * ValueNoise.sources[i0010];
	result += y.f1 * x.f1 * ValueNoise.sources[i0011];

	return result;
};

/**
 * Evaluates the three-dimensional value noise function at a specific position.
 * @param {Float} px Evaluation position x.
 * @param {Float} py Evaluation position y.
 * @param {Float} pz Evaluation position z.
 * @param {Float} scale Base scale. Greater scale values will pull the sources (hills and valleys) further apart.
 * @returns {Float} Noise value.
 */
ValueNoise.evaluate3d = function (px, py, pz, scale) {
	var x = Noise.split(px / scale);
	var y = Noise.split(py / scale);
	var z = Noise.split(pz / scale);

	var i0000 = Noise.shifter[Noise.shifter[Noise.shifter[z.i0 & 0xFF] + y.i0 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0001 = Noise.shifter[Noise.shifter[Noise.shifter[z.i0 & 0xFF] + y.i0 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i0010 = Noise.shifter[Noise.shifter[Noise.shifter[z.i0 & 0xFF] + y.i1 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0011 = Noise.shifter[Noise.shifter[Noise.shifter[z.i0 & 0xFF] + y.i1 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i0100 = Noise.shifter[Noise.shifter[Noise.shifter[z.i1 & 0xFF] + y.i0 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0101 = Noise.shifter[Noise.shifter[Noise.shifter[z.i1 & 0xFF] + y.i0 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i0110 = Noise.shifter[Noise.shifter[Noise.shifter[z.i1 & 0xFF] + y.i1 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0111 = Noise.shifter[Noise.shifter[Noise.shifter[z.i1 & 0xFF] + y.i1 & 0xFF] + x.i1 & 0xFF] & 0x0F;

	var result = 0.0;

	result += z.f0 * y.f0 * x.f0 * ValueNoise.sources[i0000];
	result += z.f0 * y.f0 * x.f1 * ValueNoise.sources[i0001];
	result += z.f0 * y.f1 * x.f0 * ValueNoise.sources[i0010];
	result += z.f0 * y.f1 * x.f1 * ValueNoise.sources[i0011];
	result += z.f1 * y.f0 * x.f0 * ValueNoise.sources[i0100];
	result += z.f1 * y.f0 * x.f1 * ValueNoise.sources[i0101];
	result += z.f1 * y.f1 * x.f0 * ValueNoise.sources[i0110];
	result += z.f1 * y.f1 * x.f1 * ValueNoise.sources[i0111];

	return result;
};

/**
 * Evaluates the four-dimensional value noise function at a specific position.
 * @param {Float} px Evaluation position x.
 * @param {Float} py Evaluation position y.
 * @param {Float} pz Evaluation position z.
 * @param {Float} pw Evaluation position w.
 * @param {Float} scale Base scale. Greater scale values will pull the sources (hills and valleys) further apart.
 * @returns {Float} Noise value.
 */
ValueNoise.evaluate4d = function (px, py, pz, pw, scale) {
	var x = Noise.split(px / scale);
	var y = Noise.split(py / scale);
	var z = Noise.split(pz / scale);
	var w = Noise.split(pw / scale);

	var i0000 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 0xFF] + z.i0 & 0xFF] + y.i0 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0001 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 0xFF] + z.i0 & 0xFF] + y.i0 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i0010 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 0xFF] + z.i0 & 0xFF] + y.i1 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0011 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 0xFF] + z.i0 & 0xFF] + y.i1 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i0100 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 0xFF] + z.i1 & 0xFF] + y.i0 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0101 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 0xFF] + z.i1 & 0xFF] + y.i0 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i0110 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 0xFF] + z.i1 & 0xFF] + y.i1 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i0111 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 0xFF] + z.i1 & 0xFF] + y.i1 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i1000 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 0xFF] + z.i0 & 0xFF] + y.i0 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i1001 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 0xFF] + z.i0 & 0xFF] + y.i0 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i1010 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 0xFF] + z.i0 & 0xFF] + y.i1 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i1011 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 0xFF] + z.i0 & 0xFF] + y.i1 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i1100 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 0xFF] + z.i1 & 0xFF] + y.i0 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i1101 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 0xFF] + z.i1 & 0xFF] + y.i0 & 0xFF] + x.i1 & 0xFF] & 0x0F;
	var i1110 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 0xFF] + z.i1 & 0xFF] + y.i1 & 0xFF] + x.i0 & 0xFF] & 0x0F;
	var i1111 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 0xFF] + z.i1 & 0xFF] + y.i1 & 0xFF] + x.i1 & 0xFF] & 0x0F;

	var result = 0.0;

	result += w.f0 * z.f0 * y.f0 * x.f0 * ValueNoise.sources[i0000];
	result += w.f0 * z.f0 * y.f0 * x.f1 * ValueNoise.sources[i0001];
	result += w.f0 * z.f0 * y.f1 * x.f0 * ValueNoise.sources[i0010];
	result += w.f0 * z.f0 * y.f1 * x.f1 * ValueNoise.sources[i0011];
	result += w.f0 * z.f1 * y.f0 * x.f0 * ValueNoise.sources[i0100];
	result += w.f0 * z.f1 * y.f0 * x.f1 * ValueNoise.sources[i0101];
	result += w.f0 * z.f1 * y.f1 * x.f0 * ValueNoise.sources[i0110];
	result += w.f0 * z.f1 * y.f1 * x.f1 * ValueNoise.sources[i0111];
	result += w.f1 * z.f0 * y.f0 * x.f0 * ValueNoise.sources[i1000];
	result += w.f1 * z.f0 * y.f0 * x.f1 * ValueNoise.sources[i1001];
	result += w.f1 * z.f0 * y.f1 * x.f0 * ValueNoise.sources[i1010];
	result += w.f1 * z.f0 * y.f1 * x.f1 * ValueNoise.sources[i1011];
	result += w.f1 * z.f1 * y.f0 * x.f0 * ValueNoise.sources[i1100];
	result += w.f1 * z.f1 * y.f0 * x.f1 * ValueNoise.sources[i1101];
	result += w.f1 * z.f1 * y.f1 * x.f0 * ValueNoise.sources[i1110];
	result += w.f1 * z.f1 * y.f1 * x.f1 * ValueNoise.sources[i1111];

	return result;
};

module.exports = ValueNoise;

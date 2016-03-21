var MathUtils = require('../math/MathUtils');

/**
 * A base class for procedural noise functions.
 * Only used to define the class. Should never be instantiated.
 */
function Noise() {}

Noise.shifter = [
	0x25, 0x5B, 0x0C, 0x80, 0xD8, 0x60, 0x33, 0x99, 0x27, 0xE7, 0xDF, 0xB4, 0xA0, 0x9D, 0x87, 0xB3,
	0x4A, 0x32, 0xCD, 0x97, 0x04, 0xD5, 0xC4, 0x3A, 0xD4, 0x78, 0x35, 0x2D, 0x0A, 0xC3, 0x89, 0x9F,
	0x67, 0x90, 0x6D, 0xAA, 0xCA, 0x30, 0x79, 0x0D, 0xF5, 0x44, 0xE8, 0x1C, 0xD2, 0xAE, 0xC5, 0x50,
	0x6B, 0xCE, 0x9C, 0x74, 0x9B, 0xF0, 0xA2, 0x4F, 0x29, 0x3B, 0x93, 0x75, 0x00, 0xF2, 0x76, 0xA4,
	0x81, 0x65, 0x62, 0x7E, 0xD6, 0x69, 0x59, 0x1A, 0x82, 0xFE, 0x55, 0xC7, 0x08, 0xA5, 0x4C, 0x4B,
	0xBB, 0xA6, 0x40, 0x8F, 0xD9, 0x95, 0x4E, 0x07, 0xAC, 0xE6, 0x57, 0x77, 0x2A, 0xF7, 0x54, 0x8B,
	0x10, 0x8D, 0x86, 0x56, 0x9A, 0x47, 0xFD, 0x3C, 0x63, 0xEB, 0xA8, 0x1E, 0x22, 0x37, 0x71, 0x8C,
	0xBF, 0x45, 0x1F, 0x6A, 0x28, 0x52, 0x49, 0x21, 0x51, 0x0E, 0xEA, 0x83, 0xFF, 0x58, 0xA9, 0x88,
	0xF8, 0x94, 0xDC, 0x8A, 0xDB, 0x66, 0x2C, 0x7F, 0x24, 0xC8, 0x5F, 0xD0, 0x36, 0x98, 0x2F, 0x14,
	0x17, 0x0F, 0x34, 0x7B, 0xB1, 0xE0, 0x7A, 0xAB, 0xD7, 0xAD, 0xD3, 0xBC, 0xBE, 0x85, 0xF4, 0xA7,
	0xEC, 0x23, 0x3F, 0x91, 0xDD, 0x68, 0x41, 0x18, 0x46, 0x64, 0x38, 0x96, 0x31, 0x4D, 0x6E, 0xE4,
	0x70, 0xD1, 0xC6, 0x01, 0xED, 0xB9, 0xFA, 0xE1, 0x5D, 0xC9, 0x7C, 0x6C, 0xDA, 0x48, 0xF3, 0x15,
	0x16, 0x06, 0x72, 0x26, 0x7D, 0x1D, 0x42, 0xF9, 0xDE, 0x6F, 0xF1, 0x0B, 0xBA, 0x3D, 0xB0, 0xB7,
	0x11, 0xA3, 0xE5, 0xA1, 0x39, 0xEE, 0xE3, 0x84, 0x43, 0x53, 0xCF, 0xE2, 0x2E, 0xBD, 0x73, 0xC1,
	0xC2, 0xE9, 0xB6, 0xC0, 0x12, 0x1B, 0x19, 0x02, 0x03, 0xFC, 0x61, 0x3E, 0xB8, 0xEF, 0xAF, 0x5C,
	0xF6, 0x8E, 0xFB, 0xCC, 0xCB, 0x20, 0x92, 0x5A, 0x13, 0x09, 0xB2, 0x9E, 0xB5, 0x5E, 0x2B, 0x05
];

/**
 * Splits a real-valued number into a record for use in smooth interpolation.
 * @hidden
 * @param {Float} x Input value.
 * @returns {Object} Object containing 'i0', 'i1', 'f0' and 'f1' members. (Integer, Integer, Float, Float)
 */
Noise.split = function (x) {
	var i = Math.floor(x);
	var f = MathUtils.scurve5(x - i);

	return { 'i0': i + 0, 'i1': i + 1, 'f0': 1.0 - f, 'f1': 0.0 + f };
};

/**
 * Evaluates a one-dimensional fractal noise function at a specific position.
 * @param {Float} x Evaluation position x.
 * @param {Float} scale Base scale. Greater scale values will pull the sources (hills and valleys) further apart.
 * @param {Integer} octaves Number of octaves.
 * @param {Float} persistance Amplitude persistance between octaves.
 * @param {Float} lacunarity Frequency scale between octaves.
 * @param {Noise} type Name of noise class extending from Noise.
 * @returns {Float} Noise value.
 */
Noise.fractal1d = function (x, scale, octaves, persistance, lacunarity, type) {
	var result = 0.0;
	var amplitude = 1.0;
	var normalizer = 0.0;

	for (var i = 0; i < octaves; i++) {
		result += amplitude * type.evaluate1d(x, scale);
		normalizer += amplitude;
		amplitude *= persistance;
		x *= lacunarity;
	}

	return result / normalizer;
};

/**
 * Evaluates a two-dimensional fractal noise function at a specific position.
 * @param {Float} x Evaluation position x.
 * @param {Float} y Evaluation position y.
 * @param {Float} scale Base scale. Greater scale values will pull the sources (hills and valleys) further apart.
 * @param {Integer} octaves Number of octaves.
 * @param {Float} persistance Amplitude persistance between octaves.
 * @param {Float} lacunarity Frequency scale between octaves.
 * @param {Noise} type Name of noise class extending from Noise.
 * @returns {Float} Noise value.
 */
Noise.fractal2d = function (x, y, scale, octaves, persistance, lacunarity, type) {
	var result = 0.0;
	var amplitude = 1.0;
	var normalizer = 0.0;

	for (var i = 0; i < octaves; i++) {
		result += amplitude * type.evaluate2d(x, y, scale);
		normalizer += amplitude;
		amplitude *= persistance;
		x *= lacunarity;
		y *= lacunarity;
	}

	return result / normalizer;
};

/**
 * Evaluates a three-dimensional fractal noise function at a specific position.
 * @param {Float} x Evaluation position x.
 * @param {Float} y Evaluation position y.
 * @param {Float} z Evaluation position z.
 * @param {Float} scale Base scale. Greater scale values will pull the sources (hills and valleys) further apart.
 * @param {Integer} octaves Number of octaves.
 * @param {Float} persistance Amplitude persistance between octaves.
 * @param {Float} lacunarity Frequency scale between octaves.
 * @param {Noise} type Name of noise class extending from Noise.
 * @returns {Float} Noise value.
 */
Noise.fractal3d = function (x, y, z, scale, octaves, persistance, lacunarity, type) {
	var result = 0.0;
	var amplitude = 1.0;
	var normalizer = 0.0;

	for (var i = 0; i < octaves; i++) {
		result += amplitude * type.evaluate3d(x, y, z, scale);
		normalizer += amplitude;
		amplitude *= persistance;
		x *= lacunarity;
		y *= lacunarity;
		z *= lacunarity;
	}

	return result / normalizer;
};

/**
 * Evaluates a four-dimensional fractal noise function at a specific position.
 * @param {Float} x Evaluation position x.
 * @param {Float} y Evaluation position y.
 * @param {Float} z Evaluation position z.
 * @param {Float} w Evaluation position w.
 * @param {Float} scale Base scale. Greater scale values will pull the sources (hills and valleys) further apart.
 * @param {Integer} octaves Number of octaves.
 * @param {Float} persistance Amplitude persistance between octaves.
 * @param {Float} lacunarity Frequency scale between octaves.
 * @param {Noise} type Name of noise class extending from Noise.
 * @returns {Float} Noise value.
 */
Noise.fractal4d = function (x, y, z, w, scale, octaves, persistance, lacunarity, type) {
	var result = 0.0;
	var amplitude = 1.0;
	var normalizer = 0.0;

	for (var i = 0; i < octaves; i++) {
		result += amplitude * type.evaluate4d(x, y, z, w, scale);
		normalizer += amplitude;
		amplitude *= persistance;
		x *= lacunarity;
		y *= lacunarity;
		z *= lacunarity;
		w *= lacunarity;
	}

	return result / normalizer;
};

module.exports = Noise;

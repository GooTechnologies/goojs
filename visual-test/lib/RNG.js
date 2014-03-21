define([], function () {
	'use strict';

	/**
	 * Seedable linear congruential random number generator
	 * @param [seed]
	 * @constructor
	 */
	function RNG(seed) {
		// c rand
		this.a = 214013;
		this.c = 2531011;
		this.m = 32768;
		this.state = typeof seed !== 'undefined' ? seed : Math.floor(Math.random() * this.m);
	}

	RNG.prototype.nextInt = function (start, end) {
		this.state = (this.state * this.a + this.c) % this.m;
		return this.state % (end - start + 1) + start;
	};

	RNG.prototype.nextFloat = function () {
		this.state = (this.state * this.a + this.c) % this.m;
		return this.state / this.m;
	};

	RNG.m = 32768;

	RNG.fromString = function (str) {
		var seed = str.split('').map(function (char) {
			return char.charCodeAt(0);
		}).reduce(function (prev, cur) {
			return (prev + cur) % RNG.m;
		}, 0);

		return new RNG(seed);
	};

	return RNG;
});

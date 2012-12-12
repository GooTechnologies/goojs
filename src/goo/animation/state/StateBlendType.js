define(['goo/util/Enum'], function(Enum) {
	"use strict";

	return new Enum(
	/** Blend linearly. */
	'Linear',

	/** Blend using a cubic S-curve: 3t^2 - 2t^3 */
	'SCurve3',

	/** Blend using a quintic S-curve: 6t^5 - 15t^4 + 10t^3 */
	'SCurve5');
	;
});
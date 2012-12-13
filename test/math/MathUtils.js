define([], function() {
	"use strict";

	// REVIEW: Missing tests for Quaternion, MathUtils, Transform. Make sure everything is covered!

	// REVIEW: Avoid repeated code by creating a function that takes vectors and tests.
	// Something like:
	// var testVectors = function(proto, factory, a, b, expected) {
	// 	it('can be copied', function() {
	// 		expect(proto.copy(a)).toEqual(expected.copyOfA);
	// 	});
	// 	it('can be added', function() {
	// 		expect(proto.add(a, a)).toEqual(expected.aPlusA);
	// 	});
	// 	.....
	// };
	// describe('Vector', function() {
	// 	var a = new Vector(2).set(2, 4);
	// 	var b = new Vector(2).set(-3, -4);
	// 	testVectors(Vector, a, b, {
	// 		copyOfA: new Vector(2).set(2, 4),
	// 		aPlusA: new Vector(2).set(4, 8),
	// 		aPlusB: new Vector(2).set(-1, 0),
	// 		...
	// 	});
	// });
	// describe('Vector2', function() {
	// 	var a = new Vector2(2, 4);
	// 	var b = new Vector2(-3, -4);
	// 	testVectors(Vector, a, b, {
	// 		copyOfA: new Vector2(2, 4),
	// 		aPlusA: new Vector2(4, 8),
	// 		aPlusB: new Vector2(-1, 0),
	// 		...
	// 	});
	// });
});

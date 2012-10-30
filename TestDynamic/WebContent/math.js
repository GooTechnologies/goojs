"use strict";

require(["goo/math/Vector", "goo/math/Vector4"], function(Vector, Vector4) {

	function init() {
		testVector();
		testVector4();
	}

	function testVector() {
		var a = new Vector(2).put(3.0).put(4.0);
		console.log(Vector.add(a, a, a) + " expected [ 6.0, 8.0 ]");

		var b = new Vector(2).put(3.0).put(4.0);
		console.log(Vector.sub(b, b, b) + " expected [ 0.0, 0.0 ]");

		var c = new Vector(2).put(3.0).put(4.0);
		console.log(Vector.mul(c, c, c) + " expected [ 9.0, 16.0 ]");

		var d = new Vector(2).put(3.0).put(4.0);
		console.log(Vector.div(d, d, d) + " expected [ 1.0, 1.0 ]");

		var e = new Vector(2).put(3.0).put(4.0);
		console.log(Vector.scale(e, 2.0, e) + " expected [ 6.0, 8.0 ]");

		var f = new Vector(2).set(0, 3.0).set(1, 4.0);
		console.log(f + " expected [ 3.0, 4.0 ]");
		console.log(f.invert() + " expected [ -3.0, -4.0 ]");

		var g = new Vector(2).put(3.0).put(4.0);
		console.log(g + " expected [ 3.0, 4.0 ]");
		console.log(g.dot() + " expected 25.0");
		console.log(g.length() + " expected 5.0");
		console.log(g.get(0) + " expected 3.0");
		console.log(g.get(1) + " expected 4.0");
		console.log(g.normalize() + " expected [ 0.6, 0.8 ]");

		var h = new Vector(2).copy(f);
		console.log(h + " expected [ -3.0, -4.0 ]");
	}

	function testVector4() {
		var a = new Vector4(3.0, 4.0, 0.0, 0.0);
		console.log(a + " expected [ 3.0, 4.0, 0.0, 0.0 ]");
	}

	init();
});

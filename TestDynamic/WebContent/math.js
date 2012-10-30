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
		var a = new Vector4(3.0, 4.0, 5.0, 0.0);
		console.log(a + " expected [ 3.0, 4.0, 5.0, 0.0 ]");

		console.log(a.x + " expected 3.0");
		console.log(a['y'] + " expected 4.0");
		console.log(a[2] + " expected 5.0");
		a.x = 1;
		a['y'] = 2;
		a[2] = 3;
		console.log(a + " expected [ 1.0, 2.0, 3.0, 0.0 ]");

		a.r = 10;
		console.log(a + " expected [ 10.0, 2.0, 3.0, 0.0 ]");

		a.set(3);
		console.log(a + " expected [ 3.0, 2.0, 3.0, 0.0 ]");
		a.set(3, 4);
		console.log(a + " expected [ 3.0, 4.0, 3.0, 0.0 ]");
		a.set(3, 4, 5, 6);
		console.log(a + " expected [ 3.0, 4.0, 5.0, 6.0 ]");

		// Tmp vec3
		var v3 = new Vector(3).setupComponents(['a', 'b', 'c']).set(1, 2, 3);
		v3.b = 10;
		console.log(v3 + " expected [ 1, 10, 3 ]");

		// Test for tmp vec2 class
		function Vec2() {
			Vector.call(this, 2);
		}
		Vec2.prototype = Object.create(Vector.prototype);
		Vec2.prototype.setupComponents(['u', 'v']);
		var v2 = new Vec2();
		v2.set(1, 2);
		console.log("" + v2);
		v2.v = 5;
		console.log("" + v2);
	}

	init();
});

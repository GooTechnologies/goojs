"use strict";

require(["goo/math/Vector", "goo/math/Vector2", "goo/math/Vector3", "goo/math/Vector4", "goo/math/Matrix", "goo/math/Matrix3x3"], function(Vector,
	Vector2, Vector3, Vector4, Matrix, Matrix3x3) {

	function init() {
		testVector();
		testVector2();
		testVector3();
		testVector4();
		testMatrix();
		testMatrix3x3();
	}

	function testVector() {
		console.log("\nTesting Vector\n");

		var a = new Vector(2).set(3.0, 4.0);
		console.log(Vector.add(a, a, a) + " expected [ 6.0, 8.0 ]");

		var b = new Vector(2).set(3.0, 4.0);
		console.log(Vector.sub(b, b, b) + " expected [ 0.0, 0.0 ]");

		var c = new Vector(2).set(3.0, 4.0);
		console.log(Vector.mul(c, c, c) + " expected [ 9.0, 16.0 ]");

		var d = new Vector(2).set(3.0, 4.0);
		console.log(Vector.div(d, d, d) + " expected [ 1.0, 1.0 ]");

		var e = new Vector(2).set(3.0, 4.0);
		console.log(Vector.scale(e, 2.0, e) + " expected [ 6.0, 8.0 ]");

		var f = new Vector(2).set(3.0, 4.0);
		console.log(f.invert() + " expected [ -3.0, -4.0 ]");

		var g = new Vector(2).copy(f);
		console.log(g + " expected [ -3.0, -4.0 ]");

		var h = new Vector(2).set(3.0, 4.0);
		console.log(h + " expected [ 3.0, 4.0 ]");
		console.log(Vector.dot(h, h) + " expected 25.0");
		console.log(h.length() + " expected 5.0");
		console.log(h.normalize() + " expected [ ~0.6, ~0.8 ]");
	}

	function testVector2() {
		console.log("\nTesting Vector2\n");

		var a = new Vector2(1.0, 2.0);
		console.log(a + " expected [ 1.0, 2.0 ]");

		a[0] = 2.0;
		a[1] = 3.0;

		console.log(a + " expected [ 2.0, 3.0 ]");
		console.log(a[0] + " expected 2.0");
		console.log(a[1] + " expected 3.0");

		a.x = 1.0;
		a.y = 2.0;

		console.log(a + " expected [ 1.0, 2.0 ]");
		console.log(a.x + " expected 1.0");
		console.log(a.y + " expected 2.0");

		a['x'] = 2.0;
		a['y'] = 3.0;

		console.log(a + " expected [ 2.0, 3.0 ]");
		console.log(a['x'] + " expected 2.0");
		console.log(a['y'] + " expected 3.0");

		a.u = 1.0;
		a.v = 2.0;

		console.log(a + " expected [ 1.0, 2.0 ]");
		console.log(a.u + " expected 1.0");
		console.log(a.v + " expected 2.0");

		a['u'] = 2.0;
		a['v'] = 3.0;

		console.log(a + " expected [ 2.0, 3.0 ]");
		console.log(a['u'] + " expected 2.0");
		console.log(a['v'] + " expected 3.0");

		a.s = 1.0;
		a.t = 2.0;

		console.log(a + " expected [ 1.0, 2.0 ]");
		console.log(a.s + " expected 1.0");
		console.log(a.t + " expected 2.0");

		a['s'] = 2.0;
		a['t'] = 3.0;

		console.log(a + " expected [ 2.0, 3.0 ]");
		console.log(a['s'] + " expected 2.0");
		console.log(a['t'] + " expected 3.0");
	}

	function testVector3() {
		console.log("\nTesting Vector3\n");

		var a = new Vector3(1.0, 2.0, 3.0);
		console.log(a + " expected [ 1.0, 2.0, 3.0 ]");

		a[0] = 2.0;
		a[1] = 3.0;
		a[2] = 4.0;

		console.log(a + " expected [ 2.0, 3.0, 4.0 ]");
		console.log(a[0] + " expected 2.0");
		console.log(a[1] + " expected 3.0");
		console.log(a[2] + " expected 4.0");

		a.x = 1.0;
		a.y = 2.0;
		a.z = 3.0;

		console.log(a + " expected [ 1.0, 2.0, 3.0 ]");
		console.log(a.x + " expected 1.0");
		console.log(a.y + " expected 2.0");
		console.log(a.z + " expected 3.0");

		a['x'] = 2.0;
		a['y'] = 3.0;
		a['z'] = 4.0;

		console.log(a + " expected [ 2.0, 3.0, 4.0 ]");
		console.log(a['x'] + " expected 2.0");
		console.log(a['y'] + " expected 3.0");
		console.log(a['z'] + " expected 4.0");

		a.r = 1.0;
		a.g = 2.0;
		a.b = 3.0;

		console.log(a + " expected [ 1.0, 2.0, 3.0 ]");
		console.log(a.r + " expected 1.0");
		console.log(a.g + " expected 2.0");
		console.log(a.b + " expected 3.0");

		a['r'] = 2.0;
		a['g'] = 3.0;
		a['b'] = 4.0;

		console.log(a + " expected [ 2.0, 3.0, 4.0 ]");
		console.log(a['r'] + " expected 2.0");
		console.log(a['g'] + " expected 3.0");
		console.log(a['b'] + " expected 4.0");
	}

	function testVector4() {
		console.log("\nTesting Vector4\n");

		var a = new Vector4(1.0, 2.0, 3.0, 4.0);
		console.log(a + " expected [ 1.0, 2.0, 3.0, 4.0 ]");

		a[0] = 2.0;
		a[1] = 3.0;
		a[2] = 4.0;
		a[3] = 5.0;

		console.log(a + " expected [ 2.0, 3.0, 4.0, 5.0 ]");
		console.log(a[0] + " expected 2.0");
		console.log(a[1] + " expected 3.0");
		console.log(a[2] + " expected 4.0");
		console.log(a[3] + " expected 5.0");

		a.x = 1.0;
		a.y = 2.0;
		a.z = 3.0;
		a.w = 4.0;

		console.log(a + " expected [ 1.0, 2.0, 3.0, 4.0 ]");
		console.log(a.x + " expected 1.0");
		console.log(a.y + " expected 2.0");
		console.log(a.z + " expected 3.0");
		console.log(a.w + " expected 4.0");

		a['x'] = 2.0;
		a['y'] = 3.0;
		a['z'] = 4.0;
		a['w'] = 5.0;

		console.log(a + " expected [ 2.0, 3.0, 4.0, 5.0 ]");
		console.log(a['x'] + " expected 2.0");
		console.log(a['y'] + " expected 3.0");
		console.log(a['z'] + " expected 4.0");
		console.log(a['w'] + " expected 5.0");

		a.r = 1.0;
		a.g = 2.0;
		a.b = 3.0;
		a.a = 4.0;

		console.log(a + " expected [ 1.0, 2.0, 3.0, 4.0 ]");
		console.log(a.r + " expected 1.0");
		console.log(a.g + " expected 2.0");
		console.log(a.b + " expected 3.0");
		console.log(a.a + " expected 4.0");

		a['r'] = 2.0;
		a['g'] = 3.0;
		a['b'] = 4.0;
		a['a'] = 5.0;

		console.log(a + " expected [ 2.0, 3.0, 4.0, 5.0 ]");
		console.log(a['r'] + " expected 2.0");
		console.log(a['g'] + " expected 3.0");
		console.log(a['b'] + " expected 4.0");
		console.log(a['a'] + " expected 5.0");
	}

	function testMatrix() {
		console.log("\nTesting Matrix\n");

		var a = new Matrix(2, 2).set(1.0, 2.0, 3.0, 4.0);
		console.log(a + " expected [ [ 1.0, 2.0 ], [ 3.0, 4.0 ] ]");
		console.log(a.e00);
	}

	function testMatrix3x3() {
		console.log("\nTesting Matrix3x3\n");

	}

	init();
});

"use strict";

require(["goo/math/Vector", "goo/math/Vector2", "goo/math/Vector3", "goo/math/Vector4", "goo/math/Matrix", "goo/math/Matrix2x2",
		"goo/math/Matrix3x3", "goo/math/Matrix4x4"], function(Vector, Vector2, Vector3, Vector4, Matrix, Matrix2x2, Matrix3x3, Matrix4x4) {

	function init() {
		testVector();
		testVector2();
		testVector3();
		testVector4();
		testMatrix();
		testMatrix2x2();
		testMatrix3x3();
		testMatrix4x4();
	}

	function testVector() {
		console.log("\nTesting Vector\n");

		var vector = new Vector(2).set(2, 4);

		console.log("Vector.copy: " + Vector.copy(vector) + " expected " + new Vector(2).set(2, 4));
		console.log("Vector.add: " + Vector.add(vector, vector) + " expected " + new Vector(2).set(4, 8));
		console.log("Vector.sub: " + Vector.sub(vector, vector) + " expected " + new Vector(2).set(0, 0));
		console.log("Vector.mul: " + Vector.mul(vector, vector) + " expected " + new Vector(2).set(4, 16));
		console.log("Vector.div: " + Vector.div(vector, vector) + " expected " + new Vector(2).set(1, 1));
		console.log("Vector.scalarAdd: " + Vector.scalarAdd(vector, 2) + " expected " + new Vector(2).set(4, 6));
		console.log("Vector.scalarSub: " + Vector.scalarSub(vector, 2) + " expected " + new Vector(2).set(0, 2));
		console.log("Vector.scalarMul: " + Vector.scalarMul(vector, 2) + " expected " + new Vector(2).set(4, 8));
		console.log("Vector.scalarDiv: " + Vector.scalarDiv(vector, 2) + " expected " + new Vector(2).set(1, 2));

		vector.set(-3, -4);

		console.log("Vector.prototype.invert: " + vector.invert() + " expected " + new Vector(2).set(3, 4));
		console.log("Vector.prototype.length: " + vector.length() + " expected 5");
		console.log("Vector.prototype.squareLength: " + vector.squareLength() + " expected 25");
		console.log("Vector.prototype.normalize: " + vector.normalize() + " expected " + new Vector(2).set(0.6, 0.8));
	}

	function testVector2() {
		console.log("\nTesting Vector2\n");

		var vector = new Vector2(1, 2);

		vector[0] = 2;
		vector[1] = 3;

		console.log(vector + " expected " + new Vector2(2, 3));
		console.log(vector[0] + " expected 2");
		console.log(vector[1] + " expected 3");

		vector.x = 1;
		vector.y = 2;

		console.log(vector + " expected " + new Vector2(1, 2));
		console.log(vector.x + " expected 1");
		console.log(vector.y + " expected 2");

		vector['x'] = 2;
		vector['y'] = 3;

		console.log(vector + " expected " + new Vector2(2, 3));
		console.log(vector['x'] + " expected 2");
		console.log(vector['y'] + " expected 3");

		vector.u = 1;
		vector.v = 2;

		console.log(vector + " expected " + new Vector2(1, 2));
		console.log(vector.u + " expected 1");
		console.log(vector.v + " expected 2");

		vector['u'] = 2;
		vector['v'] = 3;

		console.log(vector + " expected " + new Vector2(2, 3));
		console.log(vector['u'] + " expected 2");
		console.log(vector['v'] + " expected 3");

		vector.s = 1;
		vector.t = 2;

		console.log(vector + " expected " + new Vector2(1, 2));
		console.log(vector.s + " expected 1");
		console.log(vector.t + " expected 2");

		vector['s'] = 2;
		vector['t'] = 3;

		console.log(vector + " expected " + new Vector2(2, 3));
		console.log(vector['s'] + " expected 2");
		console.log(vector['t'] + " expected 3");
	}

	function testVector3() {
		console.log("\nTesting Vector3\n");

		var vector = new Vector3(1, 2, 3);

		vector[0] = 2;
		vector[1] = 3;
		vector[2] = 4;

		console.log(vector + " expected " + new Vector3(2, 3, 4));
		console.log(vector[0] + " expected 2");
		console.log(vector[1] + " expected 3");
		console.log(vector[2] + " expected 4");

		vector.x = 1;
		vector.y = 2;
		vector.z = 3;

		console.log(vector + " expected " + new Vector3(1, 2, 3));
		console.log(vector.x + " expected 1");
		console.log(vector.y + " expected 2");
		console.log(vector.z + " expected 3");

		vector['x'] = 2;
		vector['y'] = 3;
		vector['z'] = 4;

		console.log(vector + " expected " + new Vector3(2, 3, 4));
		console.log(vector['x'] + " expected 2");
		console.log(vector['y'] + " expected 3");
		console.log(vector['z'] + " expected 4");

		vector.r = 1;
		vector.g = 2;
		vector.b = 3;

		console.log(vector + " expected " + new Vector3(1, 2, 3));
		console.log(vector.r + " expected 1");
		console.log(vector.g + " expected 2");
		console.log(vector.b + " expected 3");

		vector['r'] = 2;
		vector['g'] = 3;
		vector['b'] = 4;

		console.log(vector + " expected " + new Vector3(2, 3, 4));
		console.log(vector['r'] + " expected 2");
		console.log(vector['g'] + " expected 3");
		console.log(vector['b'] + " expected 4");
	}

	function testVector4() {
		console.log("\nTesting Vector4\n");

		var vector = new Vector4(1, 2, 3, 4);

		vector[0] = 2;
		vector[1] = 3;
		vector[2] = 4;
		vector[3] = 5;

		console.log(vector + " expected " + new Vector4(2, 3, 4, 5));
		console.log(vector[0] + " expected 2");
		console.log(vector[1] + " expected 3");
		console.log(vector[2] + " expected 4");
		console.log(vector[3] + " expected 5");

		vector.x = 1;
		vector.y = 2;
		vector.z = 3;
		vector.w = 4;

		console.log(vector + " expected " + new Vector4(1, 2, 3, 4));
		console.log(vector.x + " expected 1");
		console.log(vector.y + " expected 2");
		console.log(vector.z + " expected 3");
		console.log(vector.w + " expected 4");

		vector['x'] = 2;
		vector['y'] = 3;
		vector['z'] = 4;
		vector['w'] = 5;

		console.log(vector + " expected " + new Vector4(2, 3, 4, 5));
		console.log(vector['x'] + " expected 2");
		console.log(vector['y'] + " expected 3");
		console.log(vector['z'] + " expected 4");
		console.log(vector['w'] + " expected 5");

		vector.r = 1;
		vector.g = 2;
		vector.b = 3;
		vector.a = 4;

		console.log(vector + " expected " + new Vector4(1, 2, 3, 4));
		console.log(vector.r + " expected 1");
		console.log(vector.g + " expected 2");
		console.log(vector.b + " expected 3");
		console.log(vector.a + " expected 4");

		vector['r'] = 2;
		vector['g'] = 3;
		vector['b'] = 4;
		vector['a'] = 5;

		console.log(vector + " expected " + new Vector4(2, 3, 4, 5));
		console.log(vector['r'] + " expected 2");
		console.log(vector['g'] + " expected 3");
		console.log(vector['b'] + " expected 4");
		console.log(vector['a'] + " expected 5");
	}

	function testMatrix() {
		console.log("\nTesting Matrix\n");

		var matrix = new Matrix(2, 2).set(2, 4, 6, 8);

		console.log("Matrix.combine: " + Matrix.combine(matrix, matrix) + " expected " + new Matrix(2, 2).set(28, 40, 60, 88));
		console.log("Matrix.copy: " + Matrix.copy(matrix) + " expected " + new Matrix(2, 2).set(2, 4, 6, 8));
		console.log("Matrix.add: " + Matrix.add(matrix, matrix) + " expected " + new Matrix(2, 2).set(4, 8, 12, 16));
		console.log("Matrix.sub: " + Matrix.sub(matrix, matrix) + " expected " + new Matrix(2, 2).set(0, 0, 0, 0));
		console.log("Matrix.mul: " + Matrix.mul(matrix, matrix) + " expected " + new Matrix(2, 2).set(4, 16, 36, 64));
		console.log("Matrix.div: " + Matrix.div(matrix, matrix) + " expected " + new Matrix(2, 2).set(1, 1, 1, 1));
		console.log("Matrix.scalarAdd: " + Matrix.scalarAdd(matrix, 2) + " expected " + new Matrix(2, 2).set(4, 6, 8, 10));
		console.log("Matrix.scalarSub: " + Matrix.scalarSub(matrix, 2) + " expected " + new Matrix(2, 2).set(0, 2, 4, 6));
		console.log("Matrix.scalarMul: " + Matrix.scalarMul(matrix, 2) + " expected " + new Matrix(2, 2).set(4, 8, 12, 16));
		console.log("Matrix.scalarDiv: " + Matrix.scalarDiv(matrix, 2) + " expected " + new Matrix(2, 2).set(1, 2, 3, 4));
	}

	function testMatrix2x2() {
		console.log("\nTesting Matrix2x2\n");

		var matrix = new Matrix2x2(1, 2, 3, 4);

		console.log("Matrix2x2.combine: " + Matrix2x2.combine(matrix, matrix) + " expected " + new Matrix2x2(7, 10, 15, 22));
	}

	function testMatrix3x3() {
		console.log("\nTesting Matrix3x3\n");

		var matrix = new Matrix3x3(1, 2, 3, 4, 5, 6, 7, 8, 9);

		console.log("Matrix3x3.combine: " + Matrix3x3.combine(matrix, matrix) + " expected " + new Matrix3x3(30, 36, 42, 66, 81, 96, 102, 126, 150));
	}

	function testMatrix4x4() {
		console.log("\nTesting Matrix4x4\n");

		var matrix = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

		console.log("Matrix4x4.combine: " + Matrix4x4.combine(matrix, matrix) + " expected "
			+ new Matrix4x4(90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600));
	}

	init();
});

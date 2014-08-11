define(["goo/math/Vector3"], function(Vector3) {
	"use strict";

	describe("Vector3", function() {
		it("can be accessed through indices", function() {
			var a = new Vector3(1, 2, 3);

			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
		});

		it("can be modified through indices", function() {
			var a = new Vector3();

			a[0] = 1;
			a[1] = 2;
			a[2] = 3;

			expect(a).toEqual(new Vector3(1, 2, 3));
		});

		it("can be accessed through aliases", function() {
			var a = new Vector3(1, 2, 3);

			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);
			expect(a.u).toEqual(1);
			expect(a.v).toEqual(2);
			expect(a.w).toEqual(3);
			expect(a.r).toEqual(1);
			expect(a.g).toEqual(2);
			expect(a.b).toEqual(3);
		});

		it("can be modified through aliases", function() {
			var a = new Vector3();

			a.x = 1;
			a.y = 2;
			a.z = 3;

			expect(a).toEqual(new Vector3(1, 2, 3));

			a.u = 2;
			a.v = 3;
			a.w = 4;

			expect(a).toEqual(new Vector3(2, 3, 4));

			a.r = 3;
			a.g = 4;
			a.b = 5;

			expect(a).toEqual(new Vector3(3, 4, 5));
		});

		it("can perform addition", function() {
			var a = new Vector3(1, 2, 3);
			var b = new Vector3(1, 2, 3);

			a.add(a);

			expect(a).toEqual(new Vector3(2, 4, 6));
			expect(Vector3.add(b, b)).toEqual(new Vector3(2, 4, 6));

			expect(Vector3.add(b, 1)).toEqual(new Vector3(2, 3, 4));
			expect(Vector3.add(1, b)).toEqual(new Vector3(2, 3, 4));

			expect(Vector3.add(b, [1, 2, 3])).toEqual(new Vector3(2, 4, 6));
			expect(Vector3.add([1, 2, 3], b)).toEqual(new Vector3(2, 4, 6));

			expect(function() { Vector3.add(b, [1]); }).toThrow();
			expect(function() { Vector3.add([1], b); }).toThrow();
		});

		it("can perform subtraction", function() {
			var a = new Vector3(1, 2, 3);
			var b = new Vector3(1, 2, 3);

			a.sub(a);

			expect(a).toEqual(new Vector3(0, 0, 0));
			expect(Vector3.sub(b, b)).toEqual(new Vector3(0, 0, 0));

			expect(Vector3.sub(b, 1)).toEqual(new Vector3(0, 1, 2));
			expect(Vector3.sub(1, b)).toEqual(new Vector3(0, -1, -2));

			expect(Vector3.sub(b, [1, 2, 3])).toEqual(new Vector3(0, 0, 0));
			expect(Vector3.sub([1, 2, 3], b)).toEqual(new Vector3(0, 0, 0));

			expect(function() { Vector3.sub(b, [1]); }).toThrow();
			expect(function() { Vector3.sub([1], b); }).toThrow();
		});

		it('can be negated', function () {
			var vector = new Vector3(123, 345, -567);

			vector.invert();

			expect(vector).toEqual(new Vector3(-123, -345, 567));
		});

		it("can perform multiplication", function() {
			var a = new Vector3(1, 2, 3);
			var b = new Vector3(1, 2, 3);

			a.mul(a);

			expect(a).toEqual(new Vector3(1, 4, 9));
			expect(Vector3.mul(b, b)).toEqual(new Vector3(1, 4, 9));

			expect(Vector3.mul(b, 1)).toEqual(new Vector3(1, 2, 3));
			expect(Vector3.mul(1, b)).toEqual(new Vector3(1, 2, 3));

			expect(Vector3.mul(b, [1, 2, 3])).toEqual(new Vector3(1, 4, 9));
			expect(Vector3.mul([1, 2, 3], b)).toEqual(new Vector3(1, 4, 9));

			expect(function() { Vector3.mul(b, [1]); }).toThrow();
			expect(function() { Vector3.mul([1], b); }).toThrow();
		});

		it("can perform division", function() {
			var a = new Vector3(1, 2, 3);
			var b = new Vector3(1, 2, 3);

			a.div(a);

			expect(a).toEqual(new Vector3(1, 1, 1));
			expect(Vector3.div(b, b)).toEqual(new Vector3(1, 1, 1));

			expect(Vector3.div(b, 1)).toEqual(new Vector3(1, 2, 3));
			expect(Vector3.div(1, b)).toEqual(new Vector3(1, 1/2, 1/3));

			expect(Vector3.div(b, [1, 2, 3])).toEqual(new Vector3(1, 1, 1));
			expect(Vector3.div([1, 2, 3], b)).toEqual(new Vector3(1, 1, 1));

			expect(function() { Vector3.div(b, [1]); }).toThrow();
			expect(function() { Vector3.div([1], b); }).toThrow();
		});

		it("can calculate dot products", function() {
			var a = new Vector3(1, 2);
			var b = new Vector3(1, 2);

			expect(a.dot(b)).toEqual(5);
			expect(Vector3.dot(a, b)).toEqual(5);
		});

		describe('cross', function () {
			it('can calculate cross products', function () {
				var a = new Vector3(3, 2, 1);
				var b = new Vector3(3, 2, 1);
				var c = new Vector3(1, 2, 3);

				a.cross(c);

				expect(a).toEqual(new Vector3(4, -8, 4));
				expect(Vector3.cross(b, c)).toEqual(new Vector3(4, -8, 4));
			});

			it('can calculate cross products of two vectors given as arrays', function () {
				expect(Vector3.cross([3, 2, 1], [1, 2, 3])).toEqual(new Vector3(4, -8, 4));
			});
		});

		it("can calculate the distance", function() {
			var a = new Vector3(3, 2, 1);
			var b = new Vector3(1, 2, 3);

			var dist = a.distanceSquared(b);

			expect(dist).toEqual(8);
		});

		it("can be normalized", function() {
			var a = new Vector3();

			a.set(0, 0, 0).normalize();
			expect(a.x).toBeCloseTo(0);
			expect(a.y).toBeCloseTo(0);
			expect(a.z).toBeCloseTo(0);

			a.set(1, 1, 1).normalize();
			expect(a.x).toBeCloseTo(1/Math.sqrt(3));
			expect(a.y).toBeCloseTo(1/Math.sqrt(3));
			expect(a.z).toBeCloseTo(1/Math.sqrt(3));

			a.set(12, 34, 56).normalize();
			expect(a.x).toBeCloseTo(12/Math.sqrt(12*12+34*34+56*56));
			expect(a.y).toBeCloseTo(34/Math.sqrt(12*12+34*34+56*56));
			expect(a.z).toBeCloseTo(56/Math.sqrt(12*12+34*34+56*56));
		});
	});
});

define(["goo/math/Vector2"], function(Vector2) {
	"use strict";

	describe("Vector2", function() {
		it("can be accessed through indices", function() {
			var a = new Vector2(1, 2);

			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
		});

		it("can be modified through indices", function() {
			var a = new Vector2();

			a[0] = 1;
			a[1] = 2;

			expect(a).toEqual(new Vector2(1, 2));
		});

		it("can be accessed through aliases", function() {
			var a = new Vector2(1, 2);

			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.u).toEqual(1);
			expect(a.v).toEqual(2);
			expect(a.s).toEqual(1);
			expect(a.t).toEqual(2);
		});

		it("can be modified through aliases", function() {
			var a = new Vector2();

			a.x = 1;
			a.y = 2;

			expect(a).toEqual(new Vector2(1, 2));

			a.u = 2;
			a.v = 3;

			expect(a).toEqual(new Vector2(2, 3));

			a.s = 3;
			a.t = 4;

			expect(a).toEqual(new Vector2(3, 4));
		});

		it("can perform addition", function() {
			var a = new Vector2(1, 2);
			var b = new Vector2(1, 2);

			a.add(a);

			expect(a).toEqual(new Vector2(2, 4));
			expect(Vector2.add(b, b)).toEqual(new Vector2(2, 4));

			expect(Vector2.add(b, 1)).toEqual(new Vector2(2, 3));
			expect(Vector2.add(1, b)).toEqual(new Vector2(2, 3));

			expect(Vector2.add(b, [1, 2])).toEqual(new Vector2(2, 4));
			expect(Vector2.add([1, 2], b)).toEqual(new Vector2(2, 4));

			expect(function() { Vector2.add(b, [1]); }).toThrow();
			expect(function() { Vector2.add([1], b); }).toThrow();
		});

		it("can perform subtraction", function() {
			var a = new Vector2(1, 2);
			var b = new Vector2(1, 2);

			a.sub(a);

			expect(a).toEqual(new Vector2(0, 0));
			expect(Vector2.sub(b, b)).toEqual(new Vector2(0, 0));

			expect(Vector2.sub(b, 1)).toEqual(new Vector2(0, 1));
			expect(Vector2.sub(1, b)).toEqual(new Vector2(0, -1));

			expect(Vector2.sub(b, [1, 2])).toEqual(new Vector2(0, 0));
			expect(Vector2.sub([1, 2], b)).toEqual(new Vector2(0, 0));

			expect(function() { Vector2.sub(b, [1]); }).toThrow();
			expect(function() { Vector2.sub([1], b); }).toThrow();
		});

		it("can perform multiplication", function() {
			var a = new Vector2(1, 2);
			var b = new Vector2(1, 2);

			a.mul(a);

			expect(a).toEqual(new Vector2(1, 4));
			expect(Vector2.mul(b, b)).toEqual(new Vector2(1, 4));

			expect(Vector2.mul(b, 1)).toEqual(new Vector2(1, 2));
			expect(Vector2.mul(1, b)).toEqual(new Vector2(1, 2));

			expect(Vector2.mul(b, [1, 2])).toEqual(new Vector2(1, 4));
			expect(Vector2.mul([1, 2], b)).toEqual(new Vector2(1, 4));

			expect(function() { Vector2.mul(b, [1]); }).toThrow();
			expect(function() { Vector2.mul([1], b); }).toThrow();
		});

		it("can perform division", function() {
			var a = new Vector2(1, 2);
			var b = new Vector2(1, 2);

			a.div(a);

			expect(a).toEqual(new Vector2(1, 1));
			expect(Vector2.div(b, b)).toEqual(new Vector2(1, 1));

			expect(Vector2.div(b, 1)).toEqual(new Vector2(1, 2));
			expect(Vector2.div(1, b)).toEqual(new Vector2(1, 1/2));

			expect(Vector2.div(b, [1, 2])).toEqual(new Vector2(1, 1));
			expect(Vector2.div([1, 2], b)).toEqual(new Vector2(1, 1));

			expect(function() { Vector2.div(b, [1]); }).toThrow();
			expect(function() { Vector2.div([1], b); }).toThrow();
		});

		it("can calculate dot products", function() {
			var a = new Vector2(1, 2);
			var b = new Vector2(1, 2);

			expect(a.dot(b)).toEqual(5);
			expect(Vector2.dot(a, b)).toEqual(5);
		});
	});
});

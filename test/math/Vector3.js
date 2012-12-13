define(["goo/math/Vector3"], function(Vector3) {
	"use strict";

	describe("Vector3", function() {
		var a = new Vector3(3, 2, 1);
		var b = new Vector3(1, 2, 3);

		it("Vector3.cross", function() {
			expect(Vector3.cross(a, b)).toEqual(new Vector3(4, -8, 4));
		});

		it("Array access", function() {
			a[0] = 1;
			a[1] = 2;
			a[2] = 3;

			expect(a).toEqual(new Vector3(1, 2, 3));
			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
		});

		it("Component access", function() {
			a.x = 1;
			a.y = 2;
			a.z = 3;

			expect(a).toEqual(new Vector3(1, 2, 3));
			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);

			a.r = 2;
			a.g = 3;
			a.b = 4;

			expect(a).toEqual(new Vector3(2, 3, 4));
			expect(a.r).toEqual(2);
			expect(a.g).toEqual(3);
			expect(a.b).toEqual(4);
		});

	});
});

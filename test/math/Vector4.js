define(["goo/math/Vector4"], function(Vector4) {
	"use strict";

	describe("Vector4", function() {
		var a = new Vector4();

		it("Array access", function() {
			a[0] = 1;
			a[1] = 2;
			a[2] = 3;
			a[3] = 4;

			expect(a).toEqual(new Vector4(1, 2, 3, 4));
			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
			expect(a[3]).toEqual(4);
		});

		// REVIEW: Split into more than one test
		it("Component access", function() {
			a.x = 1;
			a.y = 2;
			a.z = 3;
			a.w = 4;

			expect(a).toEqual(new Vector4(1, 2, 3, 4));
			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);
			expect(a.w).toEqual(4);

			a.r = 2;
			a.g = 3;
			a.b = 4;
			a.a = 5;

			expect(a).toEqual(new Vector4(2, 3, 4, 5));
			expect(a.r).toEqual(2);
			expect(a.g).toEqual(3);
			expect(a.b).toEqual(4);
			expect(a.a).toEqual(5);
		});
	});
});

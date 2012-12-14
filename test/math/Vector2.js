define(["goo/math/Vector2"], function(Vector2) {
	"use strict";

	describe("Vector2", function() {
		var a = new Vector2();

		// REVIEW: it('can be accessed by index')
		it("Array access", function() {
			a[0] = 1;
			a[1] = 2;

			expect(a).toEqual(new Vector2(1, 2));
			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
		});

		it("Component access", function() {
			// REVIEW: Break this down into several tests.
			// E.g. x/y, u/v, s/t, writing to component, reading from component etc.
			a.x = 1;
			a.y = 2;

			expect(a).toEqual(new Vector2(1, 2));
			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);

			a.u = 2;
			a.v = 3;

			expect(a).toEqual(new Vector2(2, 3));
			expect(a.u).toEqual(2);
			expect(a.v).toEqual(3);

			a.s = 3;
			a.t = 4;

			expect(a).toEqual(new Vector2(3, 4));
			expect(a.s).toEqual(3);
			expect(a.t).toEqual(4);
		});
	});
});

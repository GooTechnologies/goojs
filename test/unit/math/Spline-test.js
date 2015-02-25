define([
	'goo/math/Spline',
	'goo/math/Vector2',
	'test/CustomMatchers'
], function (
	Spline,
	Vector2,
	CustomMatchers
) {
	'use strict';

	describe('Spline', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('quadraticInterpolation', function () {
			it('retrieves a point for t = 0', function () {
				var point = new Vector2();
				var start = new Vector2(2, 4);
				var mid = new Vector2(10, 20);
				var end = new Vector2(8, 6);
				Spline.quadraticInterpolation(start, mid, end, 0, point);
				expect(point).toBeCloseToVector(start);
			});

			it('retrieves a point for t = 1', function () {
				var point = new Vector2();
				var start = new Vector2(2, 4);
				var mid = new Vector2(10, 20);
				var end = new Vector2(8, 6);
				Spline.quadraticInterpolation(start, mid, end, 1, point);
				expect(point).toBeCloseToVector(end);
			});
		});

		describe('cubicInterpolation', function () {
			it('retrieves a point for t = 0', function () {
				var point = new Vector2();
				var start = new Vector2(2, 4);
				var mid1 = new Vector2(10, 20);
				var mid2 = new Vector2(30, 40);
				var end = new Vector2(8, 6);
				Spline.cubicInterpolation(start, mid1, mid2, end, 0, point);
				expect(point).toBeCloseToVector(start);
			});

			it('retrieves a point for t = 1', function () {
				var point = new Vector2();
				var start = new Vector2(2, 4);
				var mid1 = new Vector2(10, 20);
				var mid2 = new Vector2(30, 40);
				var end = new Vector2(8, 6);
				Spline.cubicInterpolation(start, mid1, mid2, end, 1, point);
				expect(point).toBeCloseToVector(end);
			});
		});

		describe('getPoint', function () {
			it('retrieves a point for t = 0', function () {
				var point = new Vector2();
				var start = new Vector2(123, 456);
				var mid1 = new Vector2(1, 2);
				var mid2 = new Vector2(3, 4);
				var mid3 = new Vector2(5, 6);
				var mid4 = new Vector2(7, 8);
				var mid5 = new Vector2(9, 10);
				var end = new Vector2(321, 654);
				new Spline([start, mid1, mid2, mid3, mid4, mid5, end]).getPoint(0, point);
				expect(point).toBeCloseToVector(start);
			});

			it('retrieves a point for t = 1', function () {
				var point = new Vector2();
				var start = new Vector2(123, 456);
				var mid1 = new Vector2(1, 2);
				var mid2 = new Vector2(3, 4);
				var mid3 = new Vector2(5, 6);
				var mid4 = new Vector2(7, 8);
				var mid5 = new Vector2(9, 10);
				var end = new Vector2(321, 654);
				new Spline([start, mid1, mid2, mid3, mid4, mid5, end]).getPoint(1, point);
				expect(point).toBeCloseToVector(end);
			});

			it('retrieves a point for t = 0.5', function () {
				var point = new Vector2();
				var start = new Vector2(123, 456);
				var mid1 = new Vector2(1, 2);
				var mid2 = new Vector2(3, 4);
				var mid3 = new Vector2(5, 6);
				var mid4 = new Vector2(7, 8);
				var mid5 = new Vector2(9, 10);
				var end = new Vector2(321, 654);
				new Spline([start, mid1, mid2, mid3, mid4, mid5, end]).getPoint(0.5, point);
				expect(point).toBeCloseToVector(mid3);
			});
		});
	});
});

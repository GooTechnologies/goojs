define([
	'goo/animation/clip/LinearInterpolator'
	], function(
	LinearInterpolator
	) {
	'use strict';

	describe('LinearInterpolator', function() {
		it('can get correct value for time before every key for a dataset of 1 key', function() {
			var keys = [{ time: 10, value: 100 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(5)).toBeCloseTo(100);
		});
		it('can get correct value for time after every key for a dataset of 1 key', function() {
			var keys = [{ time: 10, value: 100 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(25)).toBeCloseTo(100);
		});
		it('can get correct value for time on first key for a dataset of 1 key', function() {
			var keys = [{ time: 10, value: 100 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(10)).toBeCloseTo(100);
		});


		it('can get correct value for time before every key for a dataset of 2 keys', function() {
			var keys = [{ time: 10, value: 100 }, { time: 15, value: 200 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(5)).toBeCloseTo(100);
		});
		it('can get correct value for time after every key for a dataset of 2 keys', function() {
			var keys = [{ time: 10, value: 100 }, { time: 15, value: 200 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(25)).toBeCloseTo(200);
		});
		it('can get correct value for time on first key for a dataset of 2 keys', function() {
			var keys = [{ time: 10, value: 100 }, { time: 15, value: 200 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(10)).toBeCloseTo(100);
		});
		it('can get correct value for time on last key for a dataset of 2 keys', function() {
			var keys = [{ time: 10, value: 100 }, { time: 15, value: 200 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(15)).toBeCloseTo(200);
		});
		it('can get correct value for time between keys for a dataset of 2 keys', function() {
			var keys = [{ time: 10, value: 100 }, { time: 40, value: 200 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(25)).toBeCloseTo(150);
		});
		it('can get correct value for time between keys for a dataset of 2 keys', function() {
			var keys = [{ time: 10, value: 100 }, { time: 50, value: 200 }];
			var interpolator = new LinearInterpolator(keys);

			expect(interpolator.getAt(20)).toBeCloseTo(125);
		});
	});
});

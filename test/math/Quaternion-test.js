define([
	'goo/math/Quaternion',
	'goo/math/Matrix3x3'
	], function(
	Quaternion,
	Matrix3x3
	) {
	'use strict';

	describe('Quaternion', function() {
		it('can create a quaternion from a 3x3 matrix', function() {
			var matrix = new Matrix3x3(1, 0, 0, 0, 1, 0, 0, 0, 1);
			var quat = new Quaternion().fromRotationMatrix(matrix);

			expect(quat.data[0]).toBeCloseTo(0);
			expect(quat.data[1]).toBeCloseTo(0);
			expect(quat.data[2]).toBeCloseTo(0);
			expect(quat.data[3]).toBeCloseTo(1);
		});

		it('can create a quaternion from a 3x3 matrix', function() {
			var matrix = new Matrix3x3(
				-2/3, 2/3, 1/3,
				2/15, -1/3, 14/15,
				11/15, 2/3, 2/15
			);
			var quat = new Quaternion().fromRotationMatrix(matrix);

			expect(quat.data[0]).toBeCloseTo(Math.sqrt(2 / 15));
			expect(quat.data[1]).toBeCloseTo(Math.sqrt(3 / 10));
			expect(quat.data[2]).toBeCloseTo(2 * Math.sqrt(2 / 15));
			expect(quat.data[3]).toBeCloseTo(1 / Math.sqrt(30));
		});
	});
});

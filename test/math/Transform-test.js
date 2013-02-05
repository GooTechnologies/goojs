define([
	'goo/math/Transform',
	'goo/math/Vector3'
], function(
	Transform,
	Vector3
) {
	'use strict';

	describe('Transform', function() {
		var t, v1, v2;
		beforeEach(function() {
			t = new Transform();
			v1 = new Vector3(10, 20, 30);
			v2 = new Vector3(0, 0, 0);

			this.addMatchers({
				toBeEqualToVector: function(expected) {
					var actual = this.actual;
					var notText = this.isNot ? ' not' : '';
					this.message = function () {
						return 'Expected ' + actual +
							notText + ' to be equal to vector ' + expected;
					};
					return actual.equals(expected);
				}
			});
		});

		it('is identity by default', function() {
			t.applyForward(v1, v2);
			expect(v2).toBeEqualToVector(v1);
		});
		it('can be scaled', function() {
			t.scale.x = 2;
			t.scale.y = 3;
			t.scale.z = 4;
			t.update();
			t.applyForward(v1, v2);
			expect(v2).toBeEqualToVector(new Vector3(10 * 2, 20 * 3, 30 * 4));
		});
	});

});

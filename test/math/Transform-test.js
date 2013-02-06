define([
	'goo/math/Transform',
	'goo/math/Vector3'
], function(
	Transform,
	Vector3
) {
	'use strict';

	/**
	 * Checks whether Transform.invert works on a test vector.
	 */
	function checkInversion (transform) {
		var vec1 = new Vector3(100, 200, 300);
		var vec2 = new Vector3();
		var vec3 = new Vector3();
		var inverted = transform.invert();
		transform.applyForward(vec1, vec2);
		inverted.applyForward(vec2, vec3);
		expect(vec3).toBeEqualToVector(vec1);
	}


	describe('Transform', function() {
		var t, v1, v2, v3;
		beforeEach(function() {
			t = new Transform();
			v1 = new Vector3(10, 20, 30);
			v2 = new Vector3(0, 0, 0);
			v3 = new Vector3(0, 0, 0);

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
		it('can be rotated around X axis', function() {
			t.rotation.x = Math.PI / 2;
			t.update();
			t.applyForward(v1, v2);
			expect(v2).toBeEqualToVector(new Vector3(10, -30, 20));
		});
		it('can be inverted if identity', function() {
			checkInversion(t);
		});
		it('can be inverted if scaled', function() {
			t.scale.x = 2;
			t.scale.y = 3;
			t.scale.z = 4;
			t.update();
			checkInversion(t);
		});
		it('can be inverted if rotated', function() {
			var inverted = new Transform();
			t.rotation.x = .2;
			t.update();
			checkInversion(t);
		});
	});

});

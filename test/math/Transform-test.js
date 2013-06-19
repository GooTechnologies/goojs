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

	/**
	 * Numerically checks whether a transform changes a vector.
	 */
	function expectNotIdentity (transform) {
		var vec1 = new Vector3(100, 200, 300);
		var vec2 = new Vector3();
		transform.applyForward(vec1, vec2);
		expect(vec1).not.toBeEqualToVector(vec2);
	}

	describe('Transform', function() {
		var t, v1, v2, v3;

		function rnd(n) {
			if(n) {
				return Math.random() * n;
			} else {
				return Math.random();
			}
		}
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
				},
				toBeEqualToMatrix: function(expected) {
					var actual = this.actual;
					var notText = this.isNot ? ' not' : '';
					this.message = function() {
						return 'Expected ' + actual + notText + ' to be equal to matrix ' + expected;
					};
					for (var i = 0; i < expected.data.length; i ++) {
						if (Math.abs(expected.data[i] - actual.data[i]) > 0.00001) {
							return false;
						}
					}
					return true;
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
		it('rotation changes a vector', function() {
			t.setRotationXYZ(Math.PI / 2, 0, 0);
			t.update();
			expectNotIdentity(t);
		});
		it('rotates around X axis', function() {
			t.setRotationXYZ(Math.PI / 2, 0, 0);
			t.update();
			t.applyForward(v1, v2);
			expect(v2).toBeEqualToVector(new Vector3(10, -30, 20));
		});
		it('centers the lookAt point in the view', function() {
			var lookAt = new Vector3(5, 0, -10);
			var up = new Vector3(0, 1, 0);
			var distance = lookAt.length();
			t.lookAt(lookAt, up);
			t.update();
			t.invert().applyForwardVector(lookAt, v2);
			expect(v2).toBeEqualToVector(new Vector3(0, 0, -distance));
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
			t.setRotationXYZ(0.2, 0, 0);
			t.update();
			checkInversion(t);
		});
		it('combines correctly', function() {
			t.translation.setd(rnd(5), rnd(5), rnd(5));
			t.scale.setd(3, 3, 3);
			t.setRotationXYZ(rnd(5),rnd(5),rnd(5));
			t.update();
			var t2 = new Transform();
			t2.translation.setd(rnd(5),rnd(5),rnd(5));
			t2.setRotationXYZ(rnd(5),rnd(5),rnd(5));
			t2.scale.setd(rnd(5),rnd(5),rnd(5));
			t2.update();
			var t3 = Transform.combine(t, t2);
			t3.update();
			t.matrix.combine(t2.matrix);

			expect(t3.matrix).toBeEqualToMatrix(t.matrix);
		});
	});

});

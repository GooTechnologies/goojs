define([
	'goo/math/Transform',
	'goo/math/Vector3',
	'test/CustomMatchers'
], function (
	Transform,
	Vector3,
	CustomMatchers
) {
	'use strict';

	/**
	 * Checks whether Transform.invert works on a test vector.
	 */
	function checkInversion(transform) {
		var vec1 = new Vector3(100, 200, 300);
		var vec2 = new Vector3();
		var vec3 = new Vector3();
		var inverted = transform.invert();
		transform.applyForward(vec1, vec2);
		inverted.applyForward(vec2, vec3);
		expect(vec3).toBeCloseToVector(vec1);
	}

	/**
	 * Numerically checks whether a transform changes a vector.
	 */
	function expectNotIdentity(transform) {
		var vec1 = new Vector3(100, 200, 300);
		var vec2 = new Vector3();
		transform.applyForward(vec1, vec2);
		expect(vec1).not.toBeCloseToVector(vec2);
	}

	describe('Transform', function () {
		var t, v1, v2, v3;

		//! AT: refactor this out of here; MathUtil should have something like this
		function rnd(n) {
			if(n) {
				return Math.random() * n;
			} else {
				return Math.random();
			}
		}

		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
			t = new Transform();
			v1 = new Vector3(10, 20, 30);
			v2 = new Vector3(0, 0, 0);
			v3 = new Vector3(0, 0, 0);
		});

		it('is identity by default', function () {
			t.applyForward(v1, v2);
			expect(v2).toBeCloseToVector(v1);
		});

		it('can be scaled', function () {
			t.scale.x = 2;
			t.scale.y = 3;
			t.scale.z = 4;
			t.update();
			t.applyForward(v1, v2);
			expect(v2).toBeCloseToVector(new Vector3(10 * 2, 20 * 3, 30 * 4));
		});

		it('rotation changes a vector', function () {
			t.setRotationXYZ(Math.PI / 2, 0, 0);
			t.update();
			expectNotIdentity(t);
		});

		it('rotates around X axis', function () {
			t.setRotationXYZ(Math.PI / 2, 0, 0);
			t.update();
			t.applyForward(v1, v2);
			expect(v2).toBeCloseToVector(new Vector3(10, -30, 20));
		});

		it('can be inverted if identity', function () {
			checkInversion(t);
		});

		it('can be inverted if scaled', function () {
			t.scale.x = 2;
			t.scale.y = 3;
			t.scale.z = 4;
			t.update();
			checkInversion(t);
		});

		it('can be inverted if rotated', function () {
			t.setRotationXYZ(0.2, 0, 0);
			t.update();
			checkInversion(t);
		});

		it('combines correctly', function () {
			t.translation.setd(rnd(5), rnd(5), rnd(5));
			t.scale.setd(3, 3, 3);
			t.setRotationXYZ(rnd(5), rnd(5), rnd(5));
			t.update();
			var t2 = new Transform();
			t2.translation.setd(rnd(5), rnd(5), rnd(5));
			t2.setRotationXYZ(rnd(5), rnd(5), rnd(5));
			t2.scale.setd(rnd(5), rnd(5), rnd(5));
			t2.update();
			var t3 = Transform.combine(t, t2);
			t3.update();
			t.matrix.combine(t2.matrix);
			expect(t3.matrix).toBeCloseToMatrix(t.matrix);
		});

		describe('lookAt', function () {
			it('centers the lookAt point in the view', function () {
				var lookAt = new Vector3(5, 0, -10);
				var up = new Vector3(0, 1, 0);
				var distance = lookAt.length();
				t.lookAt(lookAt, up);
				t.update();
				t.invert().applyForwardVector(lookAt, v2);
				expect(v2).toBeCloseToVector(new Vector3(0, 0, -distance));
			});

			it('defaults up parameter of lookAt to UNIT_Y', function () {
				var transform1 = new Transform();
				var transform2 = new Transform();

				transform1.lookAt(new Vector3(1, 2, 3));
				transform2.lookAt(new Vector3(1, 2, 3), Vector3.UNIT_Y);

				transform1.update();
				transform2.update();

				expect(transform1.matrix.equals(transform2.matrix)).toBeTruthy();

				// --- check to see if other up vector can be set
				var transform1 = new Transform();
				var transform2 = new Transform();

				transform1.lookAt(new Vector3(1, 2, 3));
				transform2.lookAt(new Vector3(1, 2, 3), Vector3.UNIT_Z);

				transform1.update();
				transform2.update();

				expect(transform1.matrix.equals(transform2.matrix)).toBeFalsy();
			});

			it('does nothing when trying to look at itself', function () {
				var transform = new Transform();
				transform.translation.setDirect(11, 22, 33);
				transform.lookAt(new Vector3(11, 22, 33));
				transform.update();

				var expected = new Transform();
				expected.translation.setDirect(11, 22, 33);
				expected.update();

				expect(transform.rotation).toBeCloseToMatrix(expected.rotation);
				expect(transform.matrix).toBeCloseToMatrix(expected.matrix);
			});
		});

		describe('combine', function () {
			it('combines and updates the resulting transform', function () {
				var transform1 = new Transform();
				transform1.translation.set(1, 2, 3);

				var transform2 = new Transform();
				transform2.translation.set(11, 22, 33);

				var result = Transform.combine(transform1, transform2);
				expect(result.translation.equals(new Vector3(1, 2, 3).add(new Vector3(11, 22, 33)))).toBeTruthy();

				expect(result.matrix[12]).toBeCloseTo(1 + 11);
				expect(result.matrix[13]).toBeCloseTo(2 + 22);
				expect(result.matrix[14]).toBeCloseTo(3 + 33);
			});
		});


		describe('multiply', function () {
			it('can multiply and keep scaling correct', function () {

				var transform1 = new Transform();
				transform1.scale.set(1, 2, 3);

				var transform2 = new Transform();
				transform2.scale.set(4, 5, 6);

				transform1.multiply(transform1, transform2);

				expect(transform1.scale).toBeCloseToVector(new Vector3(1 * 4, 2 * 5, 3 * 6));

			});
		});
	});

});

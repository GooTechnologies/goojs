define([
	'goo/math/Quaternion',
	'goo/math/Matrix3x3',
	'goo/math/Vector3',
	'test/CustomMatchers'
], function (
	Quaternion,
	Matrix3x3,
	Vector3,
	CustomMatchers
) {
	'use strict';

	describe('Quaternion', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});
		
		describe('constructor', function () {
			it('creates a zero quaternion when given no parameters', function () {
				var quaternion = new Quaternion();
				expect(quaternion).toBeCloseToVector(new Quaternion(0, 0, 0, 1));
			});

			it('creates a quaternion when given 4 parameters', function () {
				var quaternion = new Quaternion(11, 22, 33, 44);

				var expected = new Quaternion();
				expected.x = 11;
				expected.y = 22;
				expected.z = 33;
				expected.w = 44;

				expect(quaternion).toBeCloseToVector(expected);
			});
		});

		describe('mul', function () {
			it('can multiply two quaternions', function () {
				var p = new Quaternion(1, 0, 0, 0);
				var q = new Quaternion(0, 1, 0, 0);
				p.mul(q);

				expect(p).toBeCloseToVector(new Quaternion(0, 0, 1, 0));
			});
		});

		it('can slerp', function () {
			var angle1 = Math.PI / 2;
			var angle2 = 3 * Math.PI / 2;
			var startQuat = new Quaternion(Math.sin(angle1), 0, 0, Math.cos(angle1));
			var endQuat = new Quaternion(Math.sin(angle2), 0, 0, Math.cos(angle2));
			var result = new Quaternion();

			//! schteppe: TODO: How to check ok?
			Quaternion.slerp(startQuat, endQuat, 0.5, result);
		});

		it('can slerp via prototype method', function () {
			var startQuat = new Quaternion();
			var endQuat = new Quaternion();
			var result = new Quaternion();
			startQuat.slerp(endQuat, 0.5, result);
			expect(result).toEqual(new Quaternion());
		});

		describe('negate', function () {
			it('can negate', function () {
				var q = new Quaternion(1, 1, 1, 1);
				q.negate();
				expect(q).toEqual(new Quaternion(-1, -1, -1, -1));
			});
		});

		describe('conjugate', function () {
			it('conjugates a quaternion', function () {
				var original = new Quaternion(1, 2, 3, 4);
				var conjugate = new Quaternion().copy(original).conjugate();
				expect(conjugate).toBeCloseToVector(new Quaternion(-1, -2, -3, 4));
			});
		});

		describe('invert', function () {
			it('inverts a quaternion', function () {
				var original = new Quaternion(1, 2, 3, 4).normalize();
				var inverse = new Quaternion().copy(original).invert();
				expect(inverse).toBeCloseToVector(new Quaternion(-1 / 30, -2 / 30, -3 / 30, 4 / 30).normalize());
			});
		});

		it('can dot', function () {
			var q = new Quaternion(1, 1, 1, 1);
			expect(q.dot(q)).toEqual(4);
		});

		it('can be set from rotation matrix', function () {
			var q = new Quaternion();
			var m = new Matrix3x3();
			q.fromRotationMatrix(m);
			expect(q).toBeCloseToVector(new Quaternion());
		});

		it('can convert to rotation matrix', function () {
			var q = new Quaternion();
			var m = new Matrix3x3();
			q.toRotationMatrix(m);
			expect(m).toBeCloseToMatrix(Matrix3x3.IDENTITY);
		});

		it('can be set from vector to vector', function () {
			var p = new Quaternion();
			var q = new Quaternion();
			q.fromVectorToVector(new Vector3(1, 0, 0), new Vector3(0, 1, 0));
			p.fromAngleAxis(Math.PI / 2, new Vector3(0, 0, 1));
			expect(p).toBeCloseToVector(q);
		});

		it('can be normalized', function () {
			var q = new Quaternion(0, 0, 0, 2);
			q.normalize();
			expect(q.length()).toEqual(1);
		});

		it('can get length', function () {
			var q = new Quaternion(0, 0, 0, 2);
			expect(q.length()).toEqual(2);
		});

		it('can get squared length', function () {
			var q = new Quaternion(0, 0, 0, 2);
			expect(q.lengthSquared()).toEqual(4);
		});

		it('can be set from axis angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(1, 0, 0);
			var angle = 0;
			q.fromAngleAxis(angle, axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can be set from a normal axis and angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(1, 0, 0);
			var angle = 0;
			q.fromAngleNormalAxis(angle, axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can be set from a zero axis and angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(0, 0, 0);
			var angle = 0;
			q.fromAngleNormalAxis(angle, axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can generate axis and angle 1', function () {
			var q = new Quaternion();
			var axis = new Vector3(0, 0, 0);
			var angle = q.toAngleAxis(axis);
			expect(typeof angle).toEqual('number');
		});

		it('can generate axis and angle 2', function () {
			var q = new Quaternion();
			var axis = new Vector3(1, 0, 0);
			var axisResult = new Vector3();
			var angle = Math.PI/2;
			q.fromAngleNormalAxis(angle, axis);
			var angleResult = q.toAngleAxis(axisResult);
			expect(angleResult).toBeCloseTo(angle);
			expect(axisResult).toEqual(axis);
		});

		it('can set all components via other quaternion', function () {
			var q = new Quaternion();
			var p = new Quaternion(1, 2, 3, 4);
			q.set(p);
			expect(q).toBeCloseToVector(p);
		});

		describe('clone', function () {
			it('clones a quaternion', function () {
				var original = new Quaternion(1, 2, 3, 4);
				var clone = original.clone();

				expect(clone).toEqual(jasmine.any(Quaternion));
				expect(clone).not.toBe(original);
				expect(clone).toBeCloseToVector(original);
			});
		});

		describe('NaN checks (only in dev)', function () {
			it('throws an exception when trying to set a quaternion component to NaN', function () {
				var quaternion1 = new Quaternion();
				expect(function () { quaternion1.z = NaN; })
					.toThrow(new Error('Tried setting NaN to vector component z'));

				//var quaternion2 = new Quaternion();
				//expect(function () { quaternion2[1] = NaN; })
				//	.toThrow(new Error('Tried setting NaN to vector component 1'));
			});

			it('throws an exception when trying to corrupt a vector by using methods', function () {
				var quaternion1 = new Quaternion();
				expect(function () { quaternion1.mul({}); })
					.toThrow(new Error('Tried setting NaN to vector component x'));

				var quaternion2 = new Quaternion();
				expect(function () { quaternion2.setDirect(); })
					.toThrow(new Error('Tried setting NaN to vector component x'));
			});

			it('throws an exception when a corrupt quaternion would return NaN', function () {
				var quaternion = new Quaternion();
				// manually corrupting this quaternion
				// this is the only non-traceable way
				quaternion._x = NaN;
				expect(function () { quaternion.lengthSquared(); })
					.toThrow(new Error('Vector method lengthSquared returned NaN'));
			});
		});
	});
});

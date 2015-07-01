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
				expect(quaternion.data[0]).toBeCloseTo(0);
				expect(quaternion.data[1]).toBeCloseTo(0);
				expect(quaternion.data[2]).toBeCloseTo(0);
				expect(quaternion.data[3]).toBeCloseTo(1);
			});

			it('creates a quaternion when given 4 parameters', function () {
				var quaternion = new Quaternion(11, 22, 33, 44);
				var expected = new Quaternion();

				for (var i = 0; i < 4; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(quaternion).toBeCloseToVector(expected);
			});

			it('creates a quaternion when given an array', function () {
				var quaternion = new Quaternion([11, 22, 33, 44]);
				var expected = new Quaternion();

				for (var i = 0; i < 4; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(quaternion).toBeCloseToVector(expected);
			});

			it('creates a quaternion when given a quaternion', function () {
				var original = new Quaternion();
				for (var i = 0; i < 4; i++) {
					original.data[i] = (i + 1) * 11;
				}

				var quaternion = new Quaternion(original);

				var expected = new Quaternion();

				for (var i = 0; i < 4; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(quaternion).toBeCloseToVector(expected);
			});
		});

		it('can add two quaternions',function () {
			var p = new Quaternion(1,1,1,1);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.add(p,q,result);
			expect(result).toEqual(new Quaternion(3,3,3,3));
		});

		it('can subtract two quaternions',function () {
			var p = new Quaternion(1,1,1,1);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.sub(p,q,result);
			expect(result).toEqual(new Quaternion(-1,-1,-1,-1));
		});

		it('can multiply two quaternions',function () {
			var p = new Quaternion();
			var q = new Quaternion();
			var result = new Quaternion();
			Quaternion.mul(p,q,result);

			//! schteppe: TODO: How to check result?
			expect(result).toEqual(new Quaternion());
		});

		it('can divide component-wise',function () {
			var p = new Quaternion(2,2,2,2);
			var q = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.div(p,q,result);
			expect(result).toEqual(new Quaternion(1,1,1,1));
		});

		it('can add a scalar to a quaternion',function () {
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarAdd(p,1,result);
			expect(result).toEqual(new Quaternion(2,2,2,2));
		});

		it('can subtract a scalar from a quaternion',function () {
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarSub(p,1,result);
			expect(result).toEqual(new Quaternion(0,0,0,0));
		});

		it('can multiply a scalar with a quaternion',function () {
			var p = new Quaternion(1,1,1,1);
			var result = new Quaternion();
			Quaternion.scalarMul(p,2,result);
			expect(result).toEqual(new Quaternion(2,2,2,2));
		});

		it('can divide a quaternion with a scalar',function () {
			var p = new Quaternion(2,2,2,2);
			var result = new Quaternion();
			Quaternion.scalarDiv(p,2,result);
			expect(result).toEqual(new Quaternion(1,1,1,1));
		});

		it('can slerp',function () {
			var angle1 = Math.PI / 2;
			var angle2 = Math.PI;
			var half = (angle1 + angle2) / 2;

			var quat1 = new Quaternion(Math.sin(angle1), 0, 0, Math.cos(angle1));
			var quat2 = new Quaternion(Math.sin(angle2), 0, 0, Math.cos(angle2));

			var result = new Quaternion();
			var expectedResult = new Quaternion(Math.sin(half), 0, 0, Math.cos(half));

			Quaternion.slerp(quat1, quat2, 0.5, result);
			expect(result).toBeCloseToVector(expectedResult);
		});

		it('can slerp via prototype method',function () {
			var startQuat = new Quaternion();
			var endQuat = new Quaternion();
			var result = new Quaternion();
			startQuat.slerp(endQuat,0.5,result);
			expect(result).toEqual(new Quaternion());
		});

		it('can negate',function () {
			var q = new Quaternion(1,1,1,1);
			q.negate();
			expect(q).toEqual(new Quaternion(-1,-1,-1,-1));
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
				expect(inverse).toBeCloseToVector(new Quaternion(-1/30, -2/30, -3/30, 4/30).normalize());
			});
		});

		it('can dot',function () {
			var q = new Quaternion(1,1,1,1);
			expect(q.dot(q)).toEqual(4);
		});

		it('can be set from rotation matrix', function () {
			var matrix = new Matrix3x3(
				-1, 0, 0,
				0, -1, 0,
				0, 0, 1
			);

			var quaternion = new Quaternion();
			quaternion.fromRotationMatrix(matrix);

			expect(quaternion).toBeCloseToVector(new Quaternion(0, 0, 1, 0));
		});

		it('can convert to rotation matrix', function () {
			var matrix = new Matrix3x3();

			var quaternion = new Quaternion(0, 0, 1, 0);
			quaternion.toRotationMatrix(matrix);

			expect(matrix).toBeCloseToMatrix(new Matrix3x3(
				-1, 0, 0,
				0, -1, 0,
				0, 0, 1
			));
		});

		it('can be set from vector to vector', function () {
			var p = new Quaternion();
			var q = new Quaternion();
			q.fromVectorToVector(new Vector3(1, 0, 0), new Vector3(0, 1, 0));
			p.fromAngleAxis(Math.PI / 2, new Vector3(0, 0, 1));
			expect(p).toEqual(q);
		});

		it('can be normalized', function () {
			var q = new Quaternion(0,0,0,2);
			q.normalize();
			expect(q.magnitude()).toEqual(1);
		});

		it('can get magnitude', function () {
			var q = new Quaternion(0,0,0,2);
			expect(q.magnitude()).toEqual(2);
		});

		it('can get squared magnitude', function () {
			var q = new Quaternion(0,0,0,2);
			expect(q.magnitudeSquared()).toEqual(4);
		});

		it('can be set from axis angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(1,0,0);
			var angle = 0;
			q.fromAngleAxis(angle,axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can be set from a normal axis and angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(1,0,0);
			var angle = 0;
			q.fromAngleNormalAxis(angle,axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can be set from a zero axis and angle', function () {
			var q = new Quaternion();
			var axis = new Vector3(0,0,0);
			var angle = 0;
			q.fromAngleNormalAxis(angle,axis);
			expect(q).toEqual(new Quaternion());
		});

		it('can generate axis and angle 1', function () {
			var q = new Quaternion();
			var axis = new Vector3(0,0,0);
			var angle = q.toAngleAxis(axis);
			expect(typeof angle).toEqual('number');
		});

		it('can generate axis and angle 2', function () {
			var q = new Quaternion();
			var axis = new Vector3(1,0,0);
			var axisResult = new Vector3();
			var angle = Math.PI/2;
			q.fromAngleNormalAxis(angle,axis);
			var angleResult = q.toAngleAxis(axisResult);
			expect(angleResult).toBeCloseTo(angle);
			expect(axisResult).toEqual(axis);
		});

		it('can check for equality', function () {
			var q = new Quaternion();
			expect(q.equals(q)).toBeTruthy();
		});

		it('can check for equality with foreign object', function () {
			var q = new Quaternion();
			expect(q.equals(1)).toBeFalsy();
		});

		it('can set all components', function () {
			var q = new Quaternion();
			q.setd(1,2,3,4);
			expect(q).toEqual(new Quaternion(1,2,3,4));
		});

		it('can set all components via array', function () {
			var q = new Quaternion();
			q.seta([1,2,3,4]);
			expect(q).toEqual(new Quaternion(1,2,3,4));
		});

		it('can set all components via other quaternion', function () {
			var q = new Quaternion();
			var p = new Quaternion(1,2,3,4);
			q.setv(p);
			expect(q).toEqual(p);
		});

		describe('clone', function () {
			it('clones a quaternion', function () {
				var original = new Quaternion(1, 2, 3, 4);
				var clone = original.clone();

				expect(clone).toEqual(jasmine.any(Quaternion));
				expect(clone).not.toBe(original);
				expect(clone.data[0]).toBeCloseTo(original.data[0]);
				expect(clone.data[1]).toBeCloseTo(original.data[1]);
				expect(clone.data[2]).toBeCloseTo(original.data[2]);
				expect(clone.data[3]).toBeCloseTo(original.data[3]);
			});
		});

		describe('NaN checks (only in dev)', function () {
			it('throws an exception when trying to set a quaternion component to NaN', function () {
				var quaternion1 = new Quaternion();
				expect(function () { quaternion1.z = NaN; })
					.toThrow(new Error('Tried setting NaN to vector component z'));

				var quaternion2 = new Quaternion();
				expect(function () { quaternion2[1] = NaN; })
					.toThrow(new Error('Tried setting NaN to vector component 1'));
			});

			it('throws an exception when trying to corrupt a vector by using methods', function () {
				var quaternion1 = new Quaternion();
				expect(function () { quaternion1.add({ data: [] }); })
					.toThrow(new Error('Vector contains NaN at index 0'));

				var quaternion2 = new Quaternion();
				expect(function () { quaternion2.setDirect(); })
					.toThrow(new Error('Vector contains NaN at index 0'));
			});

			it('throws an exception when a corrupt quaternion would return NaN', function () {
				var quaternion = new Quaternion();
				// manually corrupting this quaternion
				// this is the only non-traceable way
				quaternion.data[0] = NaN;
				expect(function () { quaternion.magnitudeSquared(); })
					.toThrow(new Error('Vector method magnitudeSquared returned NaN'));
			});
		});
	});
});

define([
	'goo/math/Ray',
	'goo/math/Plane',
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'test/CustomMatchers'
], function (
	Ray,
	Plane,
	Vector3,
	MathUtils,
	CustomMatchers
) {

	'use strict';

	describe('Ray', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('constructor', function () {
			it('creates a ray given no parameters', function () {
				var ray = new Ray();
				expect(ray.origin.equals(new Vector3())).toBeTruthy();
				expect(ray.direction.equals(Vector3.UNIT_Z)).toBeTruthy();
			});

			it('creates a ray given only the origin', function () {
				var origin = new Vector3(1, 2, 3);
				var ray = new Ray(origin);
				expect(ray.origin.equals(origin)).toBeTruthy();
				expect(ray.direction.equals(Vector3.UNIT_Z)).toBeTruthy();
			});

			it('creates a ray given the origin and direction', function () {
				var origin = new Vector3(1, 2, 3);
				var direction = new Vector3(123, 234, 345);
				var ray = new Ray(origin, direction);
				expect(ray.origin.equals(origin)).toBeTruthy();
				expect(ray.direction.equals(direction)).toBeTruthy();
			});


			it('constructs a created ray using origin and direction', function () {
				var ray = new Ray();

				var origin = new Vector3(0,0,0);
				var direction = new Vector3(100,125,51).normalize();
				var length = 42;
				var lengthSquare = length*length;

				var computedInverseDirection = new Vector3().setDirect(MathUtils.safeInvert(direction.x), MathUtils.safeInvert(direction.y), MathUtils.safeInvert(direction.z));

				ray.constructOriginDirection(origin, direction, length);

				expect(ray.origin.equals(origin)).toBeTruthy();
				expect(ray.direction.equals(direction)).toBeTruthy();
				expect(ray.inverseDirection.equals(computedInverseDirection)).toBeTruthy();
				expect(ray.length).toBe(length);
				expect(ray.lengthSquared).toBe(lengthSquare);
			});

			it('constructs a created ray using from-to vectors', function () {
				var ray = new Ray();

				var from = new Vector3(0,0,0);
				var to = new Vector3(100,125,51);

				var computedDirection = new Vector3().setVector(to).subVector(from);
				var computedLength = computedDirection.length();
				var computedLengthSquare = computedLength*computedLength;
				computedDirection.normalize();

				var computedInverseDirection = new Vector3().setDirect(MathUtils.safeInvert(computedDirection.x), MathUtils.safeInvert(computedDirection.y), MathUtils.safeInvert(computedDirection.z));

				ray.constructFromTo(from,to);
				expect(ray.origin.equals(from)).toBeTruthy();
				expect(ray.direction.equals(computedDirection)).toBeTruthy();
				expect(ray.inverseDirection.equals(computedInverseDirection)).toBeTruthy();
				expect(ray.length).toBe(computedLength);
				expect(ray.lengthSquared).toBe(computedLengthSquare);
			});
		});

		it('intersects triangle', function () {
			var ray = new Ray(new Vector3(0,0,-1),new Vector3(0,0,1));
			var triangle = [new Vector3(-0.1, -0.1, 0),
							new Vector3(   1, -0.1, 0),
							new Vector3(   1,    1, 0)];
			var store = new Vector3(1,1,1);
			ray.intersects(triangle,false,store);
			expect(store).toEqual(new Vector3(0,0,0));
		});

		it('intersects quad', function () {
			var ray = new Ray(new Vector3(0,0,-1),new Vector3(0,0,1));
			var quad = [new Vector3(-1, -1, 0),
						new Vector3( 1, -1, 0),
						new Vector3( 1,  1, 0),
						new Vector3(-1,  1, 0)];
			var store = new Vector3(1,1,1);
			ray.intersects(quad,false,store);
			expect(store).toEqual(new Vector3(0,0,0));
		});

		describe('setDirection', function () {
			it('checks direction vector', function () {
				var ray = new Ray(new Vector3(0,0,-1), new Vector3(0,0,1));

				var direction = new Vector3(0,-1,0);
				ray.setDirection(direction);

				expect(ray.direction.x).toEqual(direction.x);
				expect(ray.direction.y).toEqual(direction.y);
				expect(ray.direction.z).toEqual(direction.z);
			});

			it('computes inverse direction', function () {
				var ray = new Ray(new Vector3(0,0,-1), new Vector3(0,0,1));

				var direction = new Vector3(1,-1,10).normalize();
				ray.setDirection(direction);


				var computedInverseDirection = new Vector3().setDirect(MathUtils.safeInvert(direction.x),MathUtils.safeInvert(direction.y),MathUtils.safeInvert(direction.z));

				var rayInverseDirection = ray.inverseDirection;

				expect(rayInverseDirection.x).toEqual(computedInverseDirection.x);
				expect(rayInverseDirection.y).toEqual(computedInverseDirection.y);
				expect(rayInverseDirection.z).toEqual(computedInverseDirection.z);
			});
		});

		describe('setLength', function () {
			it('checks length and lengthSquared', function () {
				var ray = new Ray();

				var length = 42;
				var lengthSquared = length*length;

				ray.setLength(length);

				expect(ray.length).toEqual(length);
				expect(ray.lengthSquared).toEqual(lengthSquared);
			});
		});

		describe('intersectsTriangle', function () {

		});

		describe('getDistanceToPrimitive', function () {

		});

		describe('intersectsPlane', function () {
			it('intersects a plane', function () {
				//! AT: split in 2
				var plane = new Plane(new Vector3(1, 0, 0), 4);
				var parallelRay = new Ray(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
				var intersectingRay = new Ray(new Vector3(0, 0, 0), new Vector3(1, 0, 0));

				var intersectionPoint = new Vector3();

				expect(parallelRay.intersectsPlane(plane)).toBeFalsy();

				expect(intersectingRay.intersectsPlane(plane, intersectionPoint)).toBeTruthy();
				expect(intersectionPoint.equals(new Vector3(4, 0, 0))).toBeTruthy();
			});
		});

		describe('distanceSquared', function () {
			it('computes the squared distance from a ray to a point', function () {
				//! AT: split in 2
				var ray = new Ray(new Vector3(4, 0, 0), new Vector3(0, 0, 1));
				var point = new Vector3(1, 0, 10);
				var collinearPoint = new Vector3(4, 0, 20);

				var closestPoint = new Vector3();

				expect(ray.distanceSquared(point, closestPoint)).toBeCloseTo(Math.pow(3, 2));
				expect(closestPoint.equals(new Vector3(4, 0, 10))).toBeTruthy();

				expect(ray.distanceSquared(collinearPoint, closestPoint)).toBeCloseTo(Math.pow(0, 2));
				expect(closestPoint.equals(new Vector3(4, 0, 20))).toBeTruthy();
			});
		});

		describe('copy', function () {
			it('can copy everything from another ray', function () {
				var original = new Ray(new Vector3(1, 2, 3), new Vector3(4, 5, 6));
				var copy = new Ray();
				copy.copy(original);

				expect(copy).toBeCloned(original);
			});
		});

		describe('clone', function () {
			it('can clone a ray', function () {
				var original = new Ray(new Vector3(1, 2, 3), new Vector3(4, 5, 6));
				var clone = original.clone();

				expect(clone).toBeCloned(original);
			});
		});
	});
});

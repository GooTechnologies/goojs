import Camera from 'src/goo/renderer/Camera';
import Vector3 from 'src/goo/math/Vector3';
import BoundingSphere from 'src/goo/renderer/bounds/BoundingSphere';
import BoundingBox from 'src/goo/renderer/bounds/BoundingBox';
import CustomMatchers from 'test/unit/CustomMatchers';

	describe('Camera', function () {
		var camera;

		beforeEach(function () {
			camera = new Camera(90, 1, 1, 100);
			jasmine.addMatchers(CustomMatchers);
		});

		it('can pack frustum around bounds', function () {
			var bound = new BoundingSphere();
			bound.radius = 10.0;
			bound.center.setDirect(0, 0, -20);

			camera.pack(bound);

			expect(camera._frustumNear).toBeCloseTo(10.0, 5);
			expect(camera._frustumFar).toBeCloseTo(30.0, 5);
			expect(camera._frustumLeft).toBeCloseTo(-10.0, 5);
			expect(camera._frustumBottom).toBeCloseTo(-10.0, 5);
			expect(camera._frustumTop).toBeCloseTo(10.0, 5);
			expect(camera._frustumRight).toBeCloseTo(10.0, 5);
		});

		it('can pick a ray', function () {
			var ray = camera.getPickRay(50, 50, 100, 100);
			expect(ray.origin).toBeCloseToVector(new Vector3(0, 0, -1)); // from nearplane (with negative z direction)
			expect(ray.direction).toBeCloseToVector(new Vector3(0, 0, -1));
		});

		it('can get the world position', function () {
			var vec = camera.getWorldPosition(25, 25, 100, 100, 10);
			expect(vec.z).toBeCloseTo(-10); // minus because Camera looks at negative z
		});

		it('can get the world coordinates', function () {
			var vec = camera.getWorldCoordinates(25, 25, 100, 100, 0.9091);
			expect(vec.z).toBeCloseTo(-10); // minus because Camera looks at negative z
		});

		it('can lookAt', function () {
			camera.lookAt(new Vector3(-1, 0, 0), Vector3.UNIT_Y);
			expect(camera.translation).toBeCloseToVector(new Vector3(0, 0, 0)); // from nearplane (with negative z direction)
			expect(camera._left).toBeCloseToVector(new Vector3(0, 0, 1)); // from nearplane (with negative z direction)
			expect(camera._up).toBeCloseToVector(new Vector3(0, 1, 0)); // from nearplane (with negative z direction)
			expect(camera._direction).toBeCloseToVector(new Vector3(-1, 0, 0)); // from nearplane (with negative z direction)
		});

		it('does correct intersection calculations against boundingbox and boundingsphere', function () {
			var tests = [
				[-10, 0, -10, Camera.Intersects], // place to intersect with left plane
				[10, 0, -10, Camera.Intersects], // place to intersect with right plane
				[0, 10, -10, Camera.Intersects], // place to intersect with top plane
				[0, -10, -10, Camera.Intersects], // place to intersect with bottom plane
				[0, 0, -1, Camera.Intersects], // place to intersect with near plane
				[0, 0, -100, Camera.Intersects], // place to intersect with far plane

				[0, 0, -10, Camera.Inside], // place to be inside

				[-100, 0, -10, Camera.Outside], // place to be outside left plane
				[100, 0, -10, Camera.Outside], // place to be outside right plane
				[0, 100, -10, Camera.Outside], // place to be outside top plane
				[0, -100, -10, Camera.Outside], // place to be outside bottom plane
				[0, 0, 10, Camera.Outside], // place to be outside near plane
				[0, 0, -1000, Camera.Outside] // place to be outside far plane
			];
			var testBounds = function (bounding, testdata) {
				for (var i = 0; i < testdata.length; i++) {
					var data = testdata[i];
					bounding.center.setDirect(data[0], data[1], data[2]);
					expect(camera.contains(bounding)).toBe(data[3]);
				}
			};
			testBounds(new BoundingBox(), tests);
			testBounds(new BoundingSphere(), tests);
		});

		it('can calculate corners of frustum', function () {
			var corners = camera.calculateFrustumCorners();
			expect(corners[0]).toBeCloseToVector(new Vector3(1, -1, -1));
			expect(corners[1]).toBeCloseToVector(new Vector3(-1, -1, -1));
			expect(corners[2]).toBeCloseToVector(new Vector3(-1, 1, -1));
			expect(corners[3]).toBeCloseToVector(new Vector3(1, 1, -1));
			expect(corners[4]).toBeCloseToVector(new Vector3(100, -100, -100));
			expect(corners[5]).toBeCloseToVector(new Vector3(-100, -100, -100));
			expect(corners[6]).toBeCloseToVector(new Vector3(-100, 100, -100));
			expect(corners[7]).toBeCloseToVector(new Vector3(100, 100, -100));
		});

		describe('setFrustumPerspective', function () {
			it('safely deals with far planes that are too near', function () {
				var near = 1;
				var far = 1;
				camera.setFrustumPerspective(45, 1, near, far);
				expect(camera._frustumFar - camera._frustumNear).toBeGreaterThan(0);
			});

			it('remembers the given bad values for the near and far planes', function () {
				var near = 1;
				var far = -1;
				camera.setFrustumPerspective(45, 1, near, far);
				expect(camera.near).toBeCloseTo(1);
				expect(camera.far).toBeCloseTo(-1);
			});
		});

		describe('setFrustum', function () {
			it('safely deals with far planes that are too near', function () {
				var near = 1;
				var far = 1;
				camera.setFrustum(near, far);
				expect(camera._frustumFar - camera._frustumNear).toBeGreaterThan(0);
			});

			it('remembers the given bad values for the near and far planes', function () {
				var near = 1;
				var far = -1;
				camera.setFrustum(near, far);
				expect(camera.near).toBeCloseTo(1);
				expect(camera.far).toBeCloseTo(-1);
			});
		});

		describe('copy', function () {
			it('can copy everything from another camera', function () {
				var original = new Camera(50, 2, 2, 2000);
				var copy = new Camera();
				copy.copy(original);

				expect(copy).toBeCloned(original);
			});
		});

		describe('clone', function () {
			it('clones a camera', function () {
				var original = new Camera(50, 2, 2, 2000);
				var clone = original.clone();

				expect(clone).toBeCloned(original);
			});
		});
	});

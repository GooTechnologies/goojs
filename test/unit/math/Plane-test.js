	describe('Plane', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('constructor', function () {
			it('creates a new vector pointing upwards if no parameters were passed', function () {
				var plane = new Plane();
				expect(plane.normal).toBeCloseToVector(Vector3.UNIT_Y);
				expect(plane.constant).toBeCloseTo(0);
			});
		});

		it('computes pseudodistance', function () {
			var p = new Plane();
			var dist = p.pseudoDistance(new Vector3(0, 1, 0));
			expect(dist).toEqual(1);
		});

		it('can set from points', function () {
			var p = new Plane();
			p.setPlanePoints(
				new Vector3(1, 0, 0),
				new Vector3(0, 1, 0),
				new Vector3(0, 0, 0)
			);
			expect(p.normal).toEqual(new Vector3(0, 0, 1));
		});

		it('can reflect vector', function () {
			var p = new Plane();
			var store = new Vector3();
			p.reflectVector(new Vector3(0, 1, 0), store);
			expect(store).toEqual(new Vector3(0, -1, 0));

			// Without precreating store
			store = p.reflectVector(new Vector3(0, 1, 0));
			expect(store).toEqual(new Vector3(0, -1, 0));
		});

		it('can ray intersect', function () {
			var p = new Plane(new Vector3(0, 1, 0), 1);
			var ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
			var store = new Vector3();
			p.rayIntersect(ray, store);
			expect(store).toEqual(new Vector3(0, 1, 0));

			ray.direction.setDirect(0, 0, 1);
			var result = p.rayIntersect(ray, store);
			expect(result).toBe(null);
		});

		describe('copy', function () {
			it('can copy everything from another plane', function () {
				var original = new Plane(new Vector3(1, 2, 3), 123);
				var copy = new Plane();
				copy.copy(original);

				expect(copy).toBeCloned(original);
			});
		});

		describe('clone', function () {
			it('can clone a plane', function () {
				var original = new Plane(new Vector3(1, 2, 3), 123);
				var clone = original.clone();

				expect(clone).toBeCloned(original);
			});
		});
	});

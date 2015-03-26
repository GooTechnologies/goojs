define([
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/addons/physicspack/util/Pool'
], function (
	Transform,
	Vector3,
	Pool
) {
	'use strict';

	function createPool() {
		return new Pool({
			create: function () { return new Vector3(); },
			init: Vector3.prototype.set,
			destroy: function (vector) { vector.set(0, 0, 0); } // just for testing
		});
	}

	describe('Pool', function () {

		it('can resize', function () {
			var pool = createPool();

			pool.resize(10);

			expect(pool._objects.length).toEqual(10);
		});

		it('can get', function () {
			var pool = createPool();

			var vector = pool.get(1, 2, 3);

			expect(vector).toEqual(new Vector3(1, 2, 3));
		});

		it('can release', function () {
			var pool = createPool();
			var vector = pool.get(1, 2, 3);

			expect(pool._objects.length).toEqual(0);

			pool.release(vector);

			expect(pool._objects.length).toEqual(1);
			expect(vector).toEqual(new Vector3(0, 0, 0));
		});

		it('can create', function () {
			var pool = createPool();

			var vector = pool._create();

			expect(vector).toEqual(new Vector3());
			expect(pool._objects.length).toEqual(0);
		});

		it('can destroy', function () {
			var pool = createPool();
			var vector = pool._create(1, 2, 3);

			pool._destroy(vector);

			expect(vector).toEqual(new Vector3(0, 0, 0));
			expect(pool._objects.length).toEqual(0);
		});
	});
});
define([
	'goo/math/Transform',
	'goo/addons/physicspack/util/RenderablePool'
], function (
	Transform,
	RenderablePool
) {
	'use strict';

	var meshData = 'meshData';
	var material = 'material';

	describe('RenderablePool', function () {

		it('can fill', function () {
			var pool = new RenderablePool();

			pool.fill(10, [meshData, material]);

			expect(pool.objects.length).toEqual(10);
		});

		it('can get', function () {
			var pool = new RenderablePool();

			var renderable = pool.get(meshData, material);

			expect(renderable.meshData).toBe(meshData);
			expect(renderable.materials[0]).toBe(material);
		});

		it('can release', function () {
			var pool = new RenderablePool();
			var renderable = pool.get(meshData, material);

			expect(pool.objects.length).toEqual(0);

			pool.release(renderable);

			expect(pool.objects.length).toEqual(1);
			expect(renderable.meshData).toBe(null);
			expect(renderable.materials.length).toBe(0);
		});

		it('can create', function () {
			var pool = new RenderablePool();

			var renderable = pool.create(meshData, material);

			expect(renderable).toEqual({
				transform: new Transform(),
				materials: [material],
				meshData: meshData
			});
			expect(pool.objects.length).toEqual(0);
		});

		it('can destroy', function () {
			var pool = new RenderablePool();
			var renderable = pool.create(meshData, material);

			pool.destroy(renderable);

			expect(pool.objects.length).toEqual(0);
			expect(renderable.meshData).toEqual(null);
			expect(renderable.materials.length).toEqual(0);
		});
	});
});
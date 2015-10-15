define([
	'goo/renderer/RenderQueue',
	'goo/math/Vector3'
], function (
	RenderQueue,
	Vector3
) {
	'use strict';

	describe('RenderQueue Sorting', function () {
		var createRenderable = function (name, renderQueueBucket, translation, defineKey) {
			var renderable = {
				name: name,
				defineKey: defineKey,
				transformComponent: {
					worldTransform: {
						translation: translation
					}
				},
				meshRendererComponent: {
					worldBound: null,
					materials: []
				}
			};
			if (defineKey) {
				renderable.meshRendererComponent.materials.push({
					getRenderQueue: function () {
						return renderQueueBucket;
					},
					shader: {
						defineKey: defineKey
					}
				});
			}
			return renderable;
		};

		var renderQueue, camera;
		beforeEach(function () {
			renderQueue = new RenderQueue();
			camera = {
				translation: new Vector3(0, 0, 100)
			};
		});
		it('objects without materials remain unsorted', function () {
			var r1 = createRenderable('R1', RenderQueue.OPAQUE, new Vector3(0, 0, 0), null);
			var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), null);
			var r3 = createRenderable('R3', RenderQueue.OPAQUE, new Vector3(0, 0, 20), null);

			var renderList = [r1, r2, r3];

			renderQueue.sort(renderList, camera);

			expect(renderList).toEqual([r1, r2, r3]);
		});
		it('can sort equal objects based on distance, front to back', function () {
			var r1 = createRenderable('R1', RenderQueue.OPAQUE, new Vector3(0, 0, 0), 'Key1');
			var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), 'Key1');
			var r3 = createRenderable('R3', RenderQueue.OPAQUE, new Vector3(0, 0, 20), 'Key1');

			var renderList = [r1, r2, r3];

			renderQueue.sort(renderList, camera);

			expect(renderList).toEqual([r3, r2, r1]);
		});
		it('can sort objects based on distance and shader keys', function () {
			var r1 = createRenderable('R1', RenderQueue.OPAQUE, new Vector3(0, 0, 0), 'Key1');
			var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), 'Key2_extra');
			var r3 = createRenderable('R3', RenderQueue.OPAQUE, new Vector3(0, 0, 20), 'Key1');
			var r4 = createRenderable('R4', RenderQueue.OPAQUE, new Vector3(0, 0, 30), 'Key2_extra');

			var renderList = [r1, r2, r3, r4];

			renderQueue.sort(renderList, camera);

			expect(renderList).toEqual([r4, r2, r3, r1]);
		});
		it('can sort objects based on distance and similar shader keys', function () {
			var r1 = createRenderable('R1', RenderQueue.OPAQUE, new Vector3(0, 0, 0), 'Key1');
			var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), 'Key2_extra');
			var r3 = createRenderable('R3', RenderQueue.OPAQUE, new Vector3(0, 0, 20), 'Key3_extra');
			var r4 = createRenderable('R4', RenderQueue.OPAQUE, new Vector3(0, 0, 30), 'Key1');
			var r5 = createRenderable('R5', RenderQueue.OPAQUE, new Vector3(0, 0, 40), 'Key2_extra');
			var r6 = createRenderable('R6', RenderQueue.OPAQUE, new Vector3(0, 0, 50), 'Key3_extra');

			var renderList = [r1, r2, r3, r4, r5, r6];

			renderQueue.sort(renderList, camera);

			expect(renderList).toEqual([r6, r3, r5, r2, r4, r1]);
		});

		it('can sort transparent objects based on distance, back to front', function () {
			var r1 = createRenderable('R1', RenderQueue.TRANSPARENT, new Vector3(0, 0, 0), 'Key1');
			var r2 = createRenderable('R2', RenderQueue.TRANSPARENT, new Vector3(0, 0, -10), 'Key1');
			var r3 = createRenderable('R3', RenderQueue.TRANSPARENT, new Vector3(0, 0, -20), 'Key1');

			var renderList = [r1, r2, r3];

			renderQueue.sort(renderList, camera);

			expect(renderList).toEqual([r3, r2, r1]);
		});

		it('can correctly sort both opaque and transparent objects', function () {
			var r1 = createRenderable('R1', RenderQueue.TRANSPARENT, new Vector3(0, 0, 0), 'Key1');
			var r2 = createRenderable('R2', RenderQueue.OPAQUE, new Vector3(0, 0, 10), 'Key1');
			var r3 = createRenderable('R3', RenderQueue.TRANSPARENT, new Vector3(0, 0, -20), 'Key1');
			var r4 = createRenderable('R4', RenderQueue.OPAQUE, new Vector3(0, 0, 20), 'Key1');

			var renderList = [r1, r2, r3, r4];

			renderQueue.sort(renderList, camera);

			expect(renderList).toEqual([r4, r2, r3, r1]);
		});
	});
});
define(['goo/math/Vector3'],
/** @lends */
function (Vector3) {
	'use strict';

	/**
	 * @class The RenderQueue handles sorting of entities. Entities are ordered by their renderQueue value into buckets.
	 * Entities within the opaque buckets are sorted front to back and entities within the transparent buckets are sorted
	 * back to front.
	 */
	function RenderQueue() {
		this.opaqueSorter = function (a, b) {
			//TODO: Add texture checks on material

			var m1 = a.meshRendererComponent.materials[0];
			var m2 = b.meshRendererComponent.materials[0];

			if (m1 === null || m2 === null) {
				return 0;
			}
			if (m1 === m2) {
				var bound1 = a.meshRendererComponent.worldBound;
				var bound2 = b.meshRendererComponent.worldBound;
				if (bound1 === null || bound2 === null) {
					return 0;
				}

				var dist1 = a.meshRendererComponent._renderDistance;
				var dist2 = b.meshRendererComponent._renderDistance;

				return dist1 - dist2;
			}

			var shader1 = m1.shader;
			var shader2 = m2.shader;
			if (shader1 === null || shader2 === null) {
				return 0;
			}
			if (shader1._id === shader2._id) {
				var bound1 = a.meshRendererComponent.worldBound;
				var bound2 = b.meshRendererComponent.worldBound;
				if (bound1 === null || bound2 === null) {
					return 0;
				}

				var dist1 = a.meshRendererComponent._renderDistance;
				var dist2 = b.meshRendererComponent._renderDistance;

				return dist1 - dist2;
			}
			return shader1._id - shader2._id;
		};

		this.transparentSorter = function (a, b) {
			var dist1 = a.meshRendererComponent._renderDistance;
			var dist2 = b.meshRendererComponent._renderDistance;
			return dist2 - dist1;
		};

		this.bucketSorter = function (a, b) {
			return a - b;
		};
	}

	var bucketSortList = [];

	var tmpVec = new Vector3();

	/**
	 * @param {Entity[]} renderList
	 * @param {Camera} camera
	 */
	RenderQueue.prototype.sort = function (renderList, camera) {
		// TODO: Reuse objects more
		var index = 0;
		this.camera = camera;
		var buckets = {};
		bucketSortList.length = 0;
		for (var i = 0; i < renderList.length; i++) {
			var renderable = renderList[i];
			var meshRendererComponent = renderable.meshRendererComponent;

			if (!meshRendererComponent || meshRendererComponent.materials.length === 0) {
				renderList[index] = renderable;
				index++;
				continue;
			}
			var renderQueue = meshRendererComponent.materials[0].getRenderQueue();

			var distance = 0;
			var bound = meshRendererComponent.worldBound;
			if (bound !== null) {
				distance = tmpVec.setVector(camera.translation).subVector(bound.center).lengthSquared();
			} else if (renderable.transformComponent) {
				distance = tmpVec.setVector(camera.translation).subVector(renderable.transformComponent.worldTransform.translation).lengthSquared();
			}
			meshRendererComponent._renderDistance = distance;

			var bucket = buckets[renderQueue];
			if (!bucket) {
				bucket = [];
				buckets[renderQueue] = bucket;
				bucketSortList.push(renderQueue);
			}
			bucket.push(renderable);
		}

		if (bucketSortList.length > 1) {
			bucketSortList.sort(this.bucketSorter);
		}
		for (var bucketIndex = 0; bucketIndex < bucketSortList.length; bucketIndex++) {
			var key = bucketSortList[bucketIndex];
			var bucket = buckets[key];
			if (key >= 0) {
				if (key < RenderQueue.TRANSPARENT) {
					bucket.sort(this.opaqueSorter);
				} else {
					bucket.sort(this.transparentSorter);
				}
			}
			for (var i = 0; i < bucket.length; i++) {
				renderList[index] = bucket[i];
				index++;
			}
		}
	};

	/** Rendered before any other objects. Commonly used for skyboxes and the likes
	 * @type {number}
	 * @readonly
	 * @default
	 */
	RenderQueue.BACKGROUND = 0;
	/** Used for most objects, typically opaque geometry. Rendered front to back
	 * @type {number}
	 * @readonly
	 * @default
	 */
	RenderQueue.OPAQUE = 1000;
	/** For all alpha-blended objects. Rendered back to front
	 * @type {number}
	 * @readonly
	 * @default
	 */
	RenderQueue.TRANSPARENT = 2000;
	/** For overlay effects like lens-flares etc
	 * @type {number}
	 * @readonly
	 * @default
	 */
	RenderQueue.OVERLAY = 3000;

	return RenderQueue;
});
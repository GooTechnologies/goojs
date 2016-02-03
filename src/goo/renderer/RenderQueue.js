define(['goo/math/Vector3'], function (Vector3) {
	'use strict';

	/**
	 * @class
	 * The RenderQueue handles sorting of entities. Entities are ordered by their renderQueue value into buckets.
	 * Entities within the opaque buckets are sorted front to back and entities within the transparent buckets are sorted
	 * back to front.
	 */
	function RenderQueue() {
		this.opaqueSorter = function (a, b) {
			var shader1 = a.meshRendererComponent.materials[0].shader;
			var shader2 = b.meshRendererComponent.materials[0].shader;
			if (shader1 === null || shader2 === null) {
				return 0;
			}
			if (shader1.defineKey === shader2.defineKey) {
				return a.meshRendererComponent._renderDistance - b.meshRendererComponent._renderDistance;
			}

			if (shader2.defineKey < shader1.defineKey) {
				return -1;
			} else if (shader2.defineKey > shader1.defineKey) {
				return 1;
			} else {
				return 0;
			}
		};

		this.transparentSorter = function (a, b) {
			return b.meshRendererComponent._renderDistance - a.meshRendererComponent._renderDistance;
		};

		this.bucketSorter = function (a, b) {
			return a - b;
		};
	}

	var bucketSortList = [];

	var tmpVec = new Vector3();

	/**
	 * @param {Array<Entity>} renderList
	 * @param {Camera} camera
	 */
	RenderQueue.prototype.sort = function (renderList, camera) {
		// TODO: Reuse objects more
		var index = 0;
		var buckets = {};
		bucketSortList.length = 0;
		for (var i = 0, l = renderList.length; i < l; i++) {
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
				distance = tmpVec.set(camera.translation).sub(bound.center).lengthSquared();
			} else if (renderable.transformComponent) {
				distance = tmpVec.set(camera.translation).sub(renderable.transformComponent.worldTransform.translation).lengthSquared();
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
		for (var bucketIndex = 0, l = bucketSortList.length; bucketIndex < l; bucketIndex++) {
			var key = bucketSortList[bucketIndex];
			var bucket = buckets[key];
			var bl = bucket.length;
			if (bl > 1 && key >= 0) {
				if (key < RenderQueue.TRANSPARENT) {
					bucket.sort(this.opaqueSorter);
				} else {
					bucket.sort(this.transparentSorter);
				}
			}
			for (var i = 0; i < bl; i++) {
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
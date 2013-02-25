define(['goo/math/Vector3'],
/** @lends RenderQueue */
function(Vector3) {
	"use strict";

	/**
	 * @class The purpose of this class is to hold additional information regarding a typedarray buffer, like vbo 'usage' flags
	 * @param {ArrayBuffer} data Data to wrap
	 * @param {String} target Type of data ('ArrayBuffer'/'ElementArrayBuffer')
	 * @property {ArrayBuffer} data Data to wrap
	 * @property {String} target Type of data ('ArrayBuffer'/'ElementArrayBuffer')
	 */
	function RenderQueue() {
		var that = this;
		var tmpVec = new Vector3();
		this.opaqueSorter = function(a, b) {
			//TODO: Add texture checks on material

			var shader1 = a.meshRendererComponent.materials[0].shader;
			var shader2 = b.meshRendererComponent.materials[0].shader;
			if (shader1._id === shader2._id) {
				var bound1 = a.meshRendererComponent.worldBound;
				var bound2 = b.meshRendererComponent.worldBound;
				
//				var dist1 = tmpVec.copy(that.camera.translation).sub(bound1.center).lengthSquared();
//				var dist2 = tmpVec.copy(that.camera.translation).sub(bound2.center).lengthSquared();
				var dist1 = tmpVec.setv(that.camera.translation).subv(bound1.center).lengthSquaredF();
				var dist2 = tmpVec.setv(that.camera.translation).subv(bound2.center).lengthSquaredF();
				
				return dist1 - dist2;
			}
			return shader1._id - shader2._id;
		};
		this.transparentSorter = function(a, b) {
			var bound1 = a.meshRendererComponent.worldBound;
			var bound2 = b.meshRendererComponent.worldBound;
			var dist1 = tmpVec.copy(that.camera.translation).sub(bound1.center).lengthSquared();
			var dist2 = tmpVec.copy(that.camera.translation).sub(bound2.center).lengthSquared();
			return dist2 - dist1;
		};
		this.bucketSorter = function(a, b) {
			return a - b;
		};
	}

	RenderQueue.prototype.sort = function(renderList, camera) {
		var index = 0;
		this.camera = camera;
		var buckets = {};
		var bucketSortList = [];
		for (var i = 0; i < renderList.length; i++) {
			var renderable = renderList[i];
			if (!renderable.meshRendererComponent || renderable.meshRendererComponent.materials.length === 0) {
				renderList[index] = renderable;
				index++;
				continue;
			}
			var renderQueue = renderable.meshRendererComponent.materials[0].getRenderQueue();
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
			if (key <= RenderQueue.TRANSPARENT) {
				bucket.sort(this.opaqueSorter);
			} else {
				bucket.sort(this.transparentSorter);
			}
			for ( var i = 0; i < bucket.length; i++) {
				renderList[index] = bucket[i];
				index++;
			}
		}
	};

	RenderQueue.BACKGROUND = 0;
	RenderQueue.OPAQUE = 1000;
	RenderQueue.TRANSPARENT = 2000;
	RenderQueue.OVERLAY = 3000;

	return RenderQueue;
});
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
			var bound1 = a.meshRendererComponent.worldBound;
			var bound2 = b.meshRendererComponent.worldBound;
			var dist1 = tmpVec.copy(that.camera.translation).sub(bound1.center).lengthSquared();
			var dist2 = tmpVec.copy(that.camera.translation).sub(bound2.center).lengthSquared();
			return dist1 - dist2;
		};
		this.transparentSorter = function(a, b) {
			var bound1 = a.meshRendererComponent.worldBound;
			var bound2 = b.meshRendererComponent.worldBound;
			var dist1 = tmpVec.copy(that.camera.translation).sub(bound1.center).lengthSquared();
			var dist2 = tmpVec.copy(that.camera.translation).sub(bound2.center).lengthSquared();
			return dist2 - dist1;
		};
	}

	RenderQueue.prototype.sort = function(renderList, camera) {
		var index = 0;
		this.camera = camera;
		var buckets = {};
		for ( var i = 0; i < renderList.length; i++) {
			var renderable = renderList[i];
			if (!renderable.meshRendererComponent) {
				renderList[index] = renderable;
				index++;
				continue;
			}
			var renderQueue = renderable.meshRendererComponent.materials[0].getRenderQueue();
			var bucket = buckets[renderQueue];
			if (!bucket) {
				bucket = [];
				buckets[renderQueue] = bucket;
			}
			bucket.push(renderable);
		}

		for ( var key in buckets) {
			var bucket = buckets[key];
			if (key <= RenderQueue.OPAQUE) {
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

	RenderQueue.BACKGROUND = 500;
	RenderQueue.OPAQUE = 1000;
	RenderQueue.TRANSPARENT = 1500;
	RenderQueue.OVERLAY = 2000;

	return RenderQueue;
});
define([
	'goo/addons/physicspack/util/Pool',
	'goo/math/Transform'
],
function (
	Pool,
	Transform
) {
	'use strict';

	/**
	 * Pools renderable objects
	 */
	function RenderablePool() {
		Pool.call(this);
	}
	RenderablePool.prototype = Object.create(Pool.prototype);
	RenderablePool.prototype.constructor = RenderablePool;

	/**
	 * Get an object from the pool, or create one.
	 * @param {MeshData} meshData
	 * @param {Material} material
	 * @returns {Object}
	 */
	RenderablePool.prototype.get = function (meshData, material) {
		var renderable = Pool.prototype.get.call(this);
		renderable.meshData = meshData;
		renderable.materials[0] = material;
		return renderable;
	};

	/**
	 * @param {MeshData} meshData
	 * @param {Material} material
	 * @returns {Object}
	 */
	RenderablePool.prototype.create = function (meshData, material) {
		return {
			meshData: meshData,
			transform: new Transform(),
			materials: [material]
		};
	};

	/**
	 * @param {Object} renderable
	 */
	RenderablePool.prototype.destroy = function (renderable) {
		renderable.meshData = null;
		renderable.materials.length = 0;
	};

	return RenderablePool;
});
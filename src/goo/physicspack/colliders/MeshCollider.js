define([
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Collider
) {
	'use strict';

	/**
	 * @class Physics mesh collider.
	 * @param {object} [settings]
	 * @param {MeshData} [settings.meshData]
	 * @extends Collider
	 */
	function MeshCollider(settings) {
		settings = settings || {};

		/**
		 * @type {MeshData}
		 */
		this.halfExtents = settings.meshData || null;

		Collider.call(this);
	}

	MeshCollider.prototype = Object.create(Collider.prototype);
	MeshCollider.constructor = MeshCollider;

	return MeshCollider;
});

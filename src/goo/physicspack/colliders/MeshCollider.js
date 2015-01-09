define([
	'goo/physicspack/colliders/Collider',
	'goo/math/Vector3'
],
/** @lends */
function (
	Collider,
	Vector3
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
		this.meshData = settings.meshData;

		/**
		 * @type {Vector3}
		 */
		this.scale = settings.scale !== undefined ? settings.scale.clone() : new Vector3(1, 1, 1);

		Collider.call(this);
	}
	MeshCollider.prototype = Object.create(Collider.prototype);
	MeshCollider.constructor = MeshCollider;

	MeshCollider.prototype.transform = function (transform, targetCollider) {
		targetCollider.scale.setVector(transform.scale);
	};

	MeshCollider.prototype.clone = function () {
		return new MeshCollider({
			meshData: this.meshData
		});
	};

	return MeshCollider;
});

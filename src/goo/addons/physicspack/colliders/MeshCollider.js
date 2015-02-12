define([
	'goo/addons/physicspack/colliders/Collider',
	'goo/math/Vector3'
],
function (
	Collider,
	Vector3
) {
	'use strict';

	/**
	 * Physics mesh collider.
	 * @param {object} [settings]
	 * @param {MeshData} [settings.meshData]
	 * @param {Vector3} [settings.scale]
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
	MeshCollider.prototype.constructor = MeshCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	MeshCollider.prototype.transform = function (transform, targetCollider) {
		targetCollider.scale.setVector(this.scale).mulVector(transform.scale);
	};

	/**
	 * @return {MeshCollider}
	 */
	MeshCollider.prototype.clone = function () {
		return new MeshCollider({
			meshData: this.meshData,
			scale: this.scale
		});
	};

	return MeshCollider;
});

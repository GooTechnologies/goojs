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
	 * @class
	 * @param {object} [settings]
	 * @param {object} [settings.data] An array of height values
	 * @extends Collider
	 */
	function TerrainCollider(settings) {

		/**
		 * @type {array}
		 */
		this.data = settings.data || null;

		/**
		 * @type {Vector3}
		 */
		this.scale = settings.scale !== undefined ? settings.scale.clone() : new Vector3(1, 1, 1);

		Collider.call(this);
	}
	TerrainCollider.prototype = Object.create(Collider.prototype);
	TerrainCollider.constructor = TerrainCollider;

	TerrainCollider.prototype.transform = function (transform, targetCollider) {
		targetCollider.scale.setVector(transform.scale);
	};

	TerrainCollider.prototype.clone = function () {
		return new TerrainCollider({
			meshData: this.meshData
		});
	};

	return TerrainCollider;
});

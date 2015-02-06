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
	 * A 2D grid of height values that extends in the X/Z plane.
	 * @param {object} [settings]
	 * @param {object} [settings.data] An array of height values
	 * @extends Collider
	 */
	function TerrainCollider(settings) {

		/**
		 * @type {array}
		 */
		this.data = settings.data ? new Float32Array(settings.data) : null;

		/**
		 * @type {Vector3}
		 */
		this.scale = settings.scale !== undefined ? settings.scale.clone() : new Vector3(1, 1, 1);

		Collider.call(this);
	}
	TerrainCollider.prototype = Object.create(Collider.prototype);
	TerrainCollider.prototype.constructor = TerrainCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	TerrainCollider.prototype.transform = function (transform, targetCollider) {
		targetCollider.scale.setVector(this.scale);
		targetCollider.scale.mulVector(transform.scale);
	};

	/**
	 * @return {TerrainCollider}
	 */
	TerrainCollider.prototype.clone = function () {
		return new TerrainCollider({
			data: this.data
		});
	};

	return TerrainCollider;
});

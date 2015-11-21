var Collider = require('goo/addons/physicspack/colliders/Collider');
var Vector3 = require('goo/math/Vector3');

	'use strict';

	/**
	 * Physics mesh collider.
	 * @param {Object} [settings]
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
		this.scale = settings.scale !== undefined ? new Vector3(settings.scale) : new Vector3(1, 1, 1);

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
		targetCollider.scale.set(this.scale).mul(transform.scale);
	};

	/**
	 * @returns {MeshCollider}
	 */
	MeshCollider.prototype.clone = function () {
		return new MeshCollider({
			meshData: this.meshData,
			scale: this.scale
		});
	};

	module.exports = MeshCollider;

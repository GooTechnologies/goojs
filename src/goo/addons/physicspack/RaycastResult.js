var Vector3 = require('../../math/Vector3');

	'use strict';

	/**
	 * Result container for the {@link PhysicsSystem} and {@link AmmoPhysicsSystem}.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.normal]
	 * @param {Vector3} [settings.point]
	 * @param {Entity} [settings.entity]
	 * @param {number} [settings.distance]
	 */
	function RaycastResult(settings) {
		settings = settings || {};

		/**
		 * @type {Vector3}
		 */
		this.point = settings.point ? new Vector3(settings.point) : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.normal = settings.normal ? new Vector3(settings.normal) : new Vector3();

		/**
		 * @type {Entity}
		 */
		this.entity = settings.entity || null;

		/**
		 * @type {number}
		 * @default -1
		 */
		this.distance = settings.distance || -1;
	}

	RaycastResult.prototype.reset = function () {
		this.entity = null;
		this.distance = -1;
	};

	module.exports = RaycastResult;
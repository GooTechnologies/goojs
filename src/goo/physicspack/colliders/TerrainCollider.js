define([
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Collider
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {object} [settings.data]
	 * @param {object} [settings.shapeOptions]
	 */
	function TerrainCollider(settings) {
		settings = settings || {
			data: [],
			shapeOptions: {}
		};

		// Create shape
		Collider.call(this, {
			cannonShape: new CANNON.Heightfield(settings.data, settings.shapeOptions)
		});
	}
	TerrainCollider.prototype = Object.create(Collider.prototype);
	TerrainCollider.constructor = TerrainCollider;

	return TerrainCollider;
});

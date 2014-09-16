define([
	'goo/addons/cannonpack/CannonCollider'
],
/** @lends */
function (
	CannonCollider
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class Terrain collider. Attach to an entity with a {@link CannonRigidbodyComponent}.
	 * @param {object} [settings]
	 * @param {object} [settings.data]
	 * @param {object} [settings.shapeOptions]
	 */
	function CannonTerrainCollider(settings) {
		settings = settings || {
			data: [],
			shapeOptions: {}
		};

		// Create shape
		CannonCollider.call(this, {
			cannonShape: new CANNON.Heightfield(settings.data, settings.shapeOptions)
		});
	}
	CannonTerrainCollider.prototype = Object.create(CannonCollider.prototype);
	CannonTerrainCollider.constructor = CannonTerrainCollider;

	return CannonTerrainCollider;
});

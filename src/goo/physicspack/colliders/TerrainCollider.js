define([
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Collider
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
		this.data = settings.data || [];

		Collider.call(this);

		// , {
		// 	cannonShape: new CANNON.Heightfield(settings.data, settings.shapeOptions)
		// });
	}
	TerrainCollider.prototype = Object.create(Collider.prototype);
	TerrainCollider.constructor = TerrainCollider;

	return TerrainCollider;
});

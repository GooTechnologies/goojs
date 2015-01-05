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
	 * @param {number} [settings.radiusTop=0.5]
	 * @param {number} [settings.radiusBottom=0.5]
	 * @param {number} [settings.height=1]
	 * @param {number} [settings.numSegments=10]
	 * @extends Collider
	 */
	function CylinderCollider(settings) {
		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.radiusTop = typeof(settings.radiusTop) === 'number' ? settings.radiusTop : 0.5;

		/**
		 * @type {number}
		 */
		this.radiusBottom = typeof(settings.radiusBottom) === 'number' ? settings.radiusBottom : 0.5;

		/**
		 * @type {number}
		 */
		this.height = typeof(settings.height) === 'number' ? settings.height : 1;

		/**
		 * @type {number}
		 */
		this.numSegments = typeof(settings.numSegments) === 'number' ? settings.numSegments : 10;

		Collider.call(this);
	}
	CylinderCollider.prototype = Object.create(Collider.prototype);
	CylinderCollider.constructor = CylinderCollider;

	return CylinderCollider;
});

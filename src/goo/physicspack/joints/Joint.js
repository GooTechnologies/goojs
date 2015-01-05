define([],
/** @lends */
function () {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {Entity} [settings.connectedEntity]
	 * @param {boolean} [settings.collideConnected]
	 * @variation 2
	 */
	function Joint(settings) {
		settings = settings || {};

		/**
		 * The entity connected
		 * @type {Entity}
		 */
		this.connectedEntity = settings.connectedEntity || null;

		/**
		 * Indicates if the connected entities should collide.
		 * @type {boolean}
		 */
		this.collideConnected = typeof(settings.collideConnected) ? settings.collideConnected : false;

		/**
		 * The physics engine joint
		 */
		this.joint = null;

		this._dirty = true;
	}
	Joint.constructor = Joint;

	return Joint;
});

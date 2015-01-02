define([
],
/** @lends */
function (
) {
	'use strict';

	/**
	 * Joint base class
	 * @class
	 * @param {object} [settings]
	 * @param {number} [settings.connectedEntity=null]
	 * @param {boolean} [settings.collideConnected=false]
	 */
	function Joint(settings) {
		settings = settings || {};
		this.connectedEntity = settings.connectedEntity || null;
		this.collideConnected = typeof(settings.collideConnected) ? settings.collideConnected : false;
		this.joint = null; // The physics engine joint
		this._dirty = true;
	}
	Joint.constructor = Joint;

	return Joint;
});

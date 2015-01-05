define([],
/** @lends */
function () {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 * @variation 2
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

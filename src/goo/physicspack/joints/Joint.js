define([
],
/** @lends */
function (
) {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {number} [settings.connectedBody=null]
	 * @param {boolean} [settings.collideConnected=true]
	 */
	function Joint(settings) {
		settings = settings || {};

		this.connectedBody = settings.connectedBody || null;
		this.collideConnected = true;
		this.constraint = null;
	}
	Joint.constructor = Joint;

	return Joint;
});

define([],
/** @lends */
function () {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 */
	function Collider(settings) {
		settings = settings || {};

		this.isTrigger = false;
		this.shape = settings.shape || null;
	}
	Collider.constructor = Collider;

	return Collider;
});

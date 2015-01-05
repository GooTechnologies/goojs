define([],
/** @lends */
function () {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {boolean} [settings.isTrigger]
	 */
	function Collider(settings) {
		settings = settings || {};

		/**
		 * @type {Boolean}
		 */
		this.isTrigger = typeof(settings.isTrigger) !== 'undefined' ? settings.isTrigger : false;
	}
	Collider.constructor = Collider;

	return Collider;
});

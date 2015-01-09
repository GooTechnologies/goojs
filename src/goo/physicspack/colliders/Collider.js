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
	}
	Collider.constructor = Collider;

	/**
	 * @virtual
	 * @return {Collider}
	 */
	Collider.prototype.clone = function () {
		return new Collider();
	};

	return Collider;
});

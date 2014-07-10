define([],
/** @lends */
function () {
	'use strict';

	/**
	 * @class
	 */
	function Collider() {
	}
	Collider.constructor = Collider;

	/**
	 * @return {object} JSON compatible object
	 */
	Collider.prototype.serialize = function () {
		// To be implemented by subclasses
	};

	return Collider;
});

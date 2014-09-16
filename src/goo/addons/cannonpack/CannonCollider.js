define([],
/** @lends */
function () {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 * @extends Component
	 */
	function CannonCollider(settings) {
		settings = settings || {};

		this.cannonShape = settings.cannonShape || null;
	}
	CannonCollider.constructor = CannonCollider;

	return CannonCollider;
});

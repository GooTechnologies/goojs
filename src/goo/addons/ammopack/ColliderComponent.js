define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	'use strict';

	/**
	 * @class
	 * @param {object} settings
	 */
	function ColliderComponent(collider) {
		this.type = 'ColliderComponent';

		/**
		 * @type {Collider}
		 */
		this.collider = collider;
	}
	ColliderComponent.prototype = Object.create(Component.prototype);
	ColliderComponent.constructor = ColliderComponent;

	return ColliderComponent;
});

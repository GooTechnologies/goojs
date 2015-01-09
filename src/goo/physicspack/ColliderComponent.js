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
	 * @param {object} [settings]
	 * @param {Collider} [settings.collider]
	 * @param {boolean} [settings.isTrigger]
	 * @extends Component
	 */
	function ColliderComponent(settings) {
		this.type = 'ColliderComponent';

		settings = settings || {};

		/**
		 * @type {Collider}
		 */
		this.collider = settings.collider || null;

		/**
		 * @type {boolean}
		 */
		this.isTrigger = typeof(settings.isTrigger) !== 'undefined' ? settings.isTrigger : false;
	}

	ColliderComponent.prototype = Object.create(Component.prototype);
	ColliderComponent.constructor = ColliderComponent;

	return ColliderComponent;
});

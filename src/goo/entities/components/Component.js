define(
	/** @lends */
	function () {
	'use strict';

	/**
	 * @class Base class/module for all components
	 */
	function Component() {
		/** If the component should be processed for containing entities
		 * @type {boolean}
		 * @default
		 */
		this.enabled = true;

		this.api = {};
	}

	/**
	 * Injects public methods of this component into the host entity
	 * @param entity
	 */
	Component.prototype.applyAPI = function (entity) {
		var api = this.api;
		for (var key in api) {
			if (typeof entity[key] === 'undefined') {
				entity[key] = api[key];
			} else {
				console.warn('Could not install method ' + key + ' of ' + this.type + ' as it is already taken');
			}
		}
	};

	/**
	 * Removed any methods attached to the host entity that belong to this component's API
	 * @param entity
	 */
	Component.prototype.removeAPI = function (entity) {
		var api = this.api;
		for (var key in api) {
			if (entity[key] === this.prototype[key]) {
				delete entity[key];
			}
		}
	};

	return Component;
});
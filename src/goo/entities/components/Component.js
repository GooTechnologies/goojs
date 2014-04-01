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

		//this.api = {}; // should be static (although it contains bound methods)
		this.installedAPI = {};
	}

	/**
	 * Injects public methods of this component into the host entity
	 * @param entity
	 * @private
	 */
	Component.prototype.applyAPI = function (entity) {
		if (!this.installedAPI) {
			this.installedAPI = {};
		}

		var api = this.api;
		for (var key in api) {
			if (typeof entity[key] === 'undefined') {
				entity[key] = api[key];
				this.installedAPI[key] = true;
			} else {
				console.warn('Could not install method ' + key + ' of ' + this.type + ' as it is already taken');
			}
		}
	};

	/**
	 * Removed any methods attached to the host entity that belong to this component's API
	 * @param entity
	 * @private
	 */
	Component.prototype.removeAPI = function (entity) {
		var installedAPI = this.installedAPI;
		for (var key in installedAPI) {
			delete entity[key];
		}
	};

	return Component;
});
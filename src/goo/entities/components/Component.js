define(
	/** @lends */
	function () {
	'use strict';

	/**
	 * @class Base class/module for all components.
	 * See [this engine overview article]{@link http://www.gootechnologies.com/learn/tutorials/engine/engine-overview/} for more info.
	 */
	function Component() {
		/** If the component should be processed for containing entities.
		 * @type {boolean}
		 * @default
		 */
		this.enabled = true;

		this.installedAPI = {};
	}

	/**
	 * Injects public methods of this component into the host entity.
	 * @param entity
	 * @private
	 */
	Component.prototype.applyAPI = function (entity) {
		if (!this.installedAPI) {
			this.installedAPI = {};
		}

		var api = this.api;
		if (!api) {
			return;
		}
		var keys = Object.keys(api);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (typeof entity[key] === 'undefined') {
				entity[key] = api[key];
				this.installedAPI[key] = true;
			} else {
				console.warn('Could not install method ' + key + ' of ' + this.type + ' as it is already taken');
			}
		}
	};

	/**
	 * Removed any methods attached to the host entity that belong to this component's API.
	 * @param entity
	 * @private
	 */
	Component.prototype.removeAPI = function (entity) {
		var installedAPI = this.installedAPI;
		var keys = Object.keys(installedAPI);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			delete entity[key];
		}
	};

	return Component;
});
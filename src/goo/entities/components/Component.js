define([
	'goo/entities/EntitySelection',
	'goo/util/EventBus'
], function (
	EntitySelection,
	EventBus
) {
	'use strict';

	/**
	 * Base class/module for all components.
	 * See [this engine overview article]{@link http://www.gootechnologies.com/learn/tutorials/engine/engine-overview/} for more info.
	 */
	function Component() {
		/**
		 * If the component should be processed for containing entities.
		 * @type {boolean}
		 */
		var enabled = true;

		this._isVisual = false;

		this._ownerEntity = null;

		Object.defineProperty(this, 'enabled', {
			get: function () {
				return enabled;
			},
			set: function (value) {
				if (enabled !== value) {
					enabled = value;
					// fire event to update world.changedEntity
					if (this._ownerEntity) {
						if (enabled) {
							this._ownerEntity._world.addedComponent(this._ownerEntity, this);
						} else {
							this._ownerEntity._world.removedComponent(this._ownerEntity, this);
						}
					}
				}
			}
		});

		this.installedAPI = new Set();
	}

	EventBus.attach(Component.prototype);

	/**
	 * Injects public methods of this component into the host entity.
	 * @param entity
	 * @private
	 */
	Component.prototype.applyAPI = function (entity) {
		var api = this.api;
		if (!api) {
			return;
		}
		var keys = Object.keys(api);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (typeof entity[key] === 'undefined') {
				entity[key] = api[key];
				this.installedAPI.add(key);
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
		this.installedAPI.forEach(function (key) {
			delete entity[key];
		});
	};

	Component.applyEntitySelectionAPI = function (entitySelectionAPI, componentType) {
		if (!entitySelectionAPI) { return; }

		var keys = Object.keys(entitySelectionAPI);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (typeof EntitySelection[key] === 'undefined') {
				EntitySelection.installMethod(entitySelectionAPI[key], key, componentType);
			} else {
				console.warn('Could not install method ' + key + ' on EntitySelection as it is already taken');
			}
		}
	};

	return Component;
});
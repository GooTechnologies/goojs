define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/SplineControlComponent',
	'goo/util/ObjectUtil'
], function (
	ComponentHandler,
	SplineControlComponent,
	_
) {
	'use strict';

	/**
	 * For handling loading of spline component.
	 *
	 * @extends ComponentHandler
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @hidden
	 */
	function SplineControlComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'SplineControlComponent';
	}

	SplineControlComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	SplineControlComponentHandler.prototype.constructor = SplineControlComponentHandler;
	ComponentHandler._registerClass('splineControl', SplineControlComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @private
	 */
	SplineControlComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {});
	};

	/**
	 * Create spline component object based on the config.
	 *
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {SplineControlComponent} the created component object
	 * @private
	 */
	SplineControlComponentHandler.prototype._create = function () {
		return new SplineControlComponent();
	};

	/**
	 * Remove engine component object.
	 * @param {Entity} entity The entity from which this component should be removed.
	 * @private
	 */
	SplineControlComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('SplineControlComponent');
	};

	/**
	 * Update engine component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	SplineControlComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }
		});
	};

	return SplineControlComponentHandler;
});

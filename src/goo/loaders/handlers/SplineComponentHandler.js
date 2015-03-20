define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/SplineComponent',
	'goo/util/ObjectUtil'
], function (
	ComponentHandler,
	SplineComponent,
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
	function SplineComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'SplineComponent';
	}

	SplineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	SplineComponentHandler.prototype.constructor = SplineComponentHandler;
	ComponentHandler._registerClass('spline', SplineComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @private
	 */
	SplineComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {});
	};

	/**
	 * Create spline component object based on the config.
	 *
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {SplineComponent} the created component object
	 * @private
	 */
	SplineComponentHandler.prototype._create = function () {
		return new SplineComponent();
	};

	/**
	 * Remove engine component object.
	 * @param {Entity} entity The entity from which this component should be removed.
	 * @private
	 */
	SplineComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('SplineComponent');
	};

	/**
	 * Update engine component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	SplineComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }
		});
	};

	return SplineComponentHandler;
});

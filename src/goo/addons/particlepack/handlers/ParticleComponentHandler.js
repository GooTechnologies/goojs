define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/particlepack/components/ParticleComponent',
	'goo/util/rsvp',
	'goo/util/ObjectUtils',
], function (
	ComponentHandler,
	ParticleComponent,
	RSVP,
	_
) {
	'use strict';

	/**
	 * @extends ComponentHandler
	 * @hidden
	 */
	function ParticleComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'ParticleComponent';
	}

	ParticleComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ParticleComponentHandler.prototype.constructor = ParticleComponentHandler;
	ComponentHandler._registerClass('particle', ParticleComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {Object} config
	 * @returns {Object}
	 * @private
	 */
	ParticleComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {});
	};

	/**
	 * @returns {ParticleComponent} the created component object
	 * @private
	 */
	ParticleComponentHandler.prototype._create = function () {
		return new ParticleComponent();
	};

	/**
	 * @param {string} ref
	 */
	ParticleComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('ParticleComponent');
	};

	/**
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	ParticleComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// Update component with config

			return component;
		});
	};

	return ParticleComponentHandler;
});

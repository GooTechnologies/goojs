define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/quadpack/QuadComponent'
], function (
	ComponentHandler,
	RSVP,
	PromiseUtil,
	_,
	QuadComponent
) {
	'use strict';

	/**
	 * For handling loading of quadcomponents
	 * @constructor
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @private
	 */
	function QuadComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'QuadComponent';
	}

	QuadComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	QuadComponentHandler.prototype.constructor = QuadComponentHandler;
	ComponentHandler._registerClass('quad', QuadComponentHandler);

	/**
	 * Create a quadcomponent object.
	 * @returns {QuadComponent} the created component object
	 * @private
	 */
	QuadComponentHandler.prototype._create = function () {
		return new QuadComponent();
	};

	/**
	 * Removes the quadcomponent from the entity.
	 * @param {Entity} entity
	 * @private
	 */
	QuadComponentHandler.prototype._remove = function (entity) {
		if (this.world && this.world.gooRunner) {
			entity.quadComponent.destroy(this.world.gooRunner.renderer.context);
		}
		entity.clearComponent('quadComponent');
	};

	/**
	 * Update engine quadcomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	QuadComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// Load material
			return that._load(config.materialRef, options).then(function (material) {
				// setting this here until the frontend sends good values
				material.cullState.enabled = true;

				// If the component already has got these components, they need to be overridden
				if (entity.meshRendererComponent !== component.meshRendererComponent) {
					entity.setComponent(component.meshRendererComponent);
				}
				if (entity.meshDataComponent !== component.meshDataComponent) {
					entity.setComponent(component.meshDataComponent);
				}

				component.setMaterial(material);
				component.rebuildMeshData();
				component.meshDataComponent.autoCompute = true;

				return component;
			});
		});
	};

	return QuadComponentHandler;
});

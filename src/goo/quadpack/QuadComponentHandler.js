define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/shapes/Quad',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/quadpack/QuadComponent',
],
/** @lends */
function (
	ComponentHandler,
	Quad,
	Material,
	ShaderLib,
	RSVP,
	PromiseUtil,
	_,
	MeshDataComponent,
	MeshRendererComponent,
	QuadComponent
) {
	'use strict';

	/**
	 * @class For handling loading of quadcomponents
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

	QuadComponent.DEFAULT_MATERIAL = new Material(ShaderLib.uber, 'Default material');

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	QuadComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {
		});
	};

	/**
	 * Create a quadcomponent object.
	 * @returns {object} the created component object
	 * @private
	 */
	QuadComponentHandler.prototype._create = function () {
		return new QuadComponent();
	};

	/**
	 * Removes the quadcomponent
	 * @param {Entity} entity
	 * @private
	 */
	QuadComponentHandler.prototype._remove = function (entity) {
		entity.quadComponent.removeMaterial(); // Release material
		entity.clearComponent('meshDataComponent');
		entity.clearComponent('meshRendererComponent');
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

			// Remove material
			component.removeMaterial();

			entity.clearComponent('meshRendererComponent');
			entity.clearComponent('meshDataComponent');

			// Materials
			var materialRef = config.materialRef;
			if (!materialRef) {

				// No material ref given, set default
				component.material = QuadComponent.DEFAULT_MATERIAL;
				component.attachMaterial();

				// Set components
				entity.setComponent(component.meshRendererComponent);
				entity.setComponent(component.meshDataComponent);

				return component;
			}

			return that._load(config.materialRef, options).then(function (material) {
				component.material = material;
				component.attachMaterial();

				// Set components
				entity.setComponent(component.meshRendererComponent);
				entity.setComponent(component.meshDataComponent);

				return component;
			});
		});
	};

	return QuadComponentHandler;
});

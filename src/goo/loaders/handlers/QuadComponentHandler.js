define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	ComponentHandler,
	MeshRendererComponent,
	Material,
	ShaderLib,
	RSVP,
	pu,
	_
) {
	"use strict";

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

	QuadComponentHandler.DEFAULT_MATERIAL = Material.createMaterial(ShaderLib.uber, 'Default material');

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	QuadComponentHandler.prototype._prepare = function(config) {
		return _.defaults(config, {
		});
	};

	/**
	 * Create a QuadComponent.
	 * @returns {QuadComponent} the created component object
	 * @private
	 */
	QuadComponentHandler.prototype._create = function() {
		return new MeshRendererComponent();
	};

	/**
	 * Update engine quadcomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	 QuadComponentHandler.prototype.update = function(entity, config, options) {
		var that = this;

		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function(component) {
			if (!component) { return; }

			// Materials - ???
			var materials = config.materials;
			if(!materials || !Object.keys(materials).length) {
				var selectionMaterial = component.materials.filter(function(material) {
					return material.name === 'gooSelectionIndicator';
				});
				component.materials = [QuadComponentHandler.DEFAULT_MATERIAL].concat(selectionMaterial);
				return component;
			}

			var promises = [];
			_.forEach(materials, function(item) {
				promises.push(that._load(item.materialRef, options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function(materials) {
				var selectionMaterial = component.materials.filter(function(material) {
					return material.name === 'gooSelectionIndicator';
				});
				component.materials = materials.concat(selectionMaterial);
				return component;
			});
		});
	};

	return QuadComponentHandler;
});

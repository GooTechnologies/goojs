define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ComponentHandler,
	MeshRendererComponent,
	Material,
	ShaderLib,
	RSVP,
	pu,
	_
) {
	"use strict";

	/*
	 * @class For handling loading of meshrenderercomponents
	 * @constructor
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 */
	function MeshRendererComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'MeshRendererComponent';
	}

	MeshRendererComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	MeshRendererComponentHandler.prototype.constructor = MeshRendererComponentHandler;
	ComponentHandler._registerClass('meshRenderer', MeshRendererComponentHandler);

	/*
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	MeshRendererComponentHandler.prototype._prepare = function(config) {
		return _.defaults(config, {
			materialRefs: [],
			cullMode: 'Dynamic',
			castShadows: true,
			receiveShadows: true,
			hidden: false
		});
	};

	/*
	 * Create meshrenderer component.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {MeshRendererComponent} the created component object
	 * @private
	 */
	MeshRendererComponentHandler.prototype._create = function(entity) {
		var component = new MeshRendererComponent();
		entity.setComponent(component);
		return component;
	};

	MeshRendererComponentHandler.prototype.update = function(entity, config) {
		var that = this;

		var promise;

		var component = ComponentHandler.prototype.update.call(this, entity, config);
		var materialRefs = config.materialRefs;
		if (!materialRefs || materialRefs.length === 0) {
			//console.log('No material refs in config for ' + entity.ref + ', creating default');
			var defaultShader = Material.createShader(ShaderLib.uber, 'DefaultShader');
			var material = new Material();
			material.shader = defaultShader;

			promise = pu.createDummyPromise([material]);
		} else {
			var promises = [];
			var pushPromise = function(materialRef) {
				return promises.push(that._getMaterial(materialRef));
			};
			for (var i = 0; i < materialRefs.length; i++) {
				pushPromise(materialRefs[i]);
			}
			promise = RSVP.all(promises);
		}
		return promise.then(function(materials) {
			var key, value;
			if (component.materials && component.materials.length) {
				var selectMaterial;
				for (var i = 0; i < component.materials.length; i++) {
					var material = component.materials[i];
					if (material.name === 'gooSelectionIndicator') {
						selectMaterial = material;
						break;
					}
				}
				if (selectMaterial) {
					materials.push(selectMaterial);
				}
			}
			component.materials = materials;
			for (key in config) {
				value = config[key];
				if (key !== 'materials' && key !== 'hidden' && component.hasOwnProperty(key)) {
					component[key] = _.clone(value);
				}
			}
			return component;
		}).then(null, function(err) {
			return console.error("Error handling materials " + err);
		});
	};

	MeshRendererComponentHandler.prototype._getMaterial = function(ref) {
		var that = this;
		return this.getConfig(ref).then(function(config) {
			return that.updateObject(ref, config, that.options);
		});
	};

	return MeshRendererComponentHandler;
});

define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/TransformComponent',
	'goo/math/MathUtils',
	'goo/math/Quaternion',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/util/ArrayUtil',
	'goo/util/rsvp'
],
/** @lends */
function(
	ComponentHandler,
	TransformComponent,
	MathUtils,
	Quaternion,
	PromiseUtil,
	_,
	ArrayUtil,
	RSVP
) {
	"use strict";

	/**
	 * @class For handling loading of transform component
	 * @constructor
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @private
	 * @extends ComponentHandler
	 */
	function TransformComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'TransformComponent';
	}

	TransformComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	TransformComponentHandler.prototype.constructor = TransformComponentHandler;
	ComponentHandler._registerClass('transform', TransformComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @private
	 */
	TransformComponentHandler.prototype._prepare = function(config) {
		return _.defaults(config, {
			translation: [0, 0, 0],
			rotation: [0, 0, 0],
			scale: [1, 1, 1]
		});
	};

	/**
	 * Create transform component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {TransformComponent} the created component object
	 * @private
	 */
	TransformComponentHandler.prototype._create = function() {
		return new TransformComponent();
	};

	/**
	 * Remove engine component object. TransformComponents can't be removed, so we reset.
	 * @param {Entity} entity The entity from which this component should be removed.
	 * @private
	 */
	TransformComponentHandler.prototype._remove = function(entity) {
		var component = entity.transformComponent;
		// Reset
		component.transform.translation.setd(0, 0, 0);
		component.transform.setRotationXYZ(0, 0, 0);
		component.transform.scale.setd(1, 1, 1);

		// Detach all children
		for (var i = 0; i < component.children.length; i++) {
			var child = component.children[i];
			component.detachChild(child);
		}
		component.setUpdated();
	};

	/**
	 * Update engine transform component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	TransformComponentHandler.prototype.update = function(entity, config, options) {
		var that = this;

		// REVIEW: remove it
		/*
		function hasChild(component, ref) {
			for (var i = 0; i < component.children.length; i++) {
				if (component.children[i].entity.id === ref) {
					return true;
				}
			}
			return false;
		}
		*/

		function attachChild(component, ref) {
			return that.loadObject(ref, options).then(function(entity) {
				if (entity && entity.transformComponent) {
					component.attachChild(entity.transformComponent);
					entity.addToWorld();
				} else {
					console.error('Failed to add child to transform component');
				}
				return component;
			});
		}

		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function(component) {
			if (!component) {
				// Component was removed
				return;
			}

			// Translation
			component.transform.translation.seta(config.translation);
			// Rotation
			component.transform.setRotationXYZ(
				MathUtils.radFromDeg(config.rotation[0]),
				MathUtils.radFromDeg(config.rotation[1]),
				MathUtils.radFromDeg(config.rotation[2])
			);
			// Scale
			component.transform.scale.seta(config.scale);

			var promises = [];
			if (config.children) {
				// Attach children
				// TODO: Watch out for circular dependencies
				var keys = Object.keys(config.children);
				for (var i = 0; i < keys.length; i++) {
					var childRef = config.children[keys[i]].entityRef;
					promises.push(attachChild(component, childRef));
				}
				for (var i = 0; i < component.children.length; i++) {
					var child = component.children[i];
					var id = child.entity.id;
					if (!config.children[id]) {
						component.detachChild(child);
					}
				}
			} else {
				// Detach all children
				for (var i = 0; i < component.children.length; i++) {
					var child = component.children[i];
					component.detachChild(child);
				}
			}

			// When all children are attached, return component
			return RSVP.all(promises).then(function() {
				component.setUpdated();
				return component;
			});
		});
	};

	return TransformComponentHandler;
});
